import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import RoleGuard from '../auth/RoleGuard'
import { usersApi, type UserWithRolesDto } from '../api/users.api'

const ROLE_CHOICES = [
  { value: 'SuperAdmin', label: 'Super Admin' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Teacher', label: 'Teacher' },
]

const normalizeRole = (role: string | undefined) => {
  if (!role) return 'Teacher'
  if (role === 'Super Admin') return 'SuperAdmin'
  return role
}

const getPrimaryRole = (user: UserWithRolesDto) => {
  return normalizeRole(user.roles?.[0])
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithRolesDto[]>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingRoles, setEditingRoles] = useState<Record<string, string>>({})
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const loadUsers = async () => {
    setErr(null)
    setBusy(true)
    try {
      const data = await usersApi.list()
      setUsers(data)
    } catch (error: any) {
      setErr(error?.response?.data ?? 'Failed to load users')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const manageableUsers = useMemo(() => {
    return users.filter((user) => getPrimaryRole(user) !== 'Learner')
  }, [users])

  useEffect(() => {
    const map: Record<string, string> = {}
    manageableUsers.forEach((user) => {
      map[user.id] = getPrimaryRole(user)
    })
    setEditingRoles(map)
  }, [manageableUsers])

  const filteredUsers = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase()
    if (!trimmed) return manageableUsers
    return manageableUsers.filter((user) => {
      const haystack = [user.fullName, user.email, user.adminId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(trimmed)
    })
  }, [searchQuery, manageableUsers])

  const handleRoleChange = (userId: string, role: string) => {
    setEditingRoles((prev) => ({ ...prev, [userId]: role }))
  }

  const handleSave = async (userId: string) => {
    const user = manageableUsers.find((u) => u.id === userId)
    if (!user) return
    const selectedRole = editingRoles[userId] ?? getPrimaryRole(user)
    const existingRole = getPrimaryRole(user)
    if (selectedRole === existingRole) return
    setErr(null)
    setSavingUserId(userId)
    try {
      const updated = await usersApi.setRoles({ userId, roles: [selectedRole] })
      setUsers((prev) => prev.map((existing) => (existing.id === userId ? updated : existing)))
    } catch (error: any) {
      setErr(error?.response?.data ?? 'Failed to save roles')
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <ProtectedRoute>
      <RoleGuard allow={['SuperAdmin', 'Super Admin', 'Admin']}>
        <Layout>
          <div className="grid">
            <div className="col-12">
              <div className="card">
                <div className="card-h">
                  <div>
                    <div style={{ fontWeight: 900 }}>User management</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Update assignment of roles for teachers and admins.
                    </div>
                  </div>
                  <div className="spacer" />
                  <span className="pill">{manageableUsers.length} managed</span>
                </div>
                <div className="card-b">
                  {err && (
                    <div className="empty" style={{ borderStyle: 'solid', borderColor: 'rgba(240,68,56,0.35)' }}>
                      {String(err)}
                    </div>
                  )}

                  <div className="row" style={{ alignItems: 'flex-end', gap: 12 }}>
                    <div className="field" style={{ flex: 1, minWidth: 0, maxWidth: 360 }}>
                      <label>Search users</label>
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Full name, email, or admin ID"
                      />
                    </div>
                    <span className="pill">{filteredUsers.length} visible</span>
                  </div>
                  <div className="muted" style={{ marginTop: 8, fontSize: '0.85rem' }}>
                    Select the one role per user using the radios, then save that row to persist the change.
                  </div>

                  {busy ? (
                    <div className="empty">Loading users…</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="empty">No users match that query.</div>
                  ) : (
                    <div className="table-wrapper" style={{ marginTop: 16 }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => {
                            const existingRole = getPrimaryRole(user)
                            const currentRole = editingRoles[user.id] ?? existingRole
                            const hasChanges = currentRole !== existingRole
                            return (
                              <tr key={user.id}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>{user.fullName ?? 'Unnamed user'}</div>
                                  <div className="muted" style={{ marginTop: 6 }}>
                                    Account ID {user.id}
                                  </div>
                                </td>
                                <td>
                                  <div>{user.email}</div>
                                  {user.adminId && (
                                    <div className="muted" style={{ marginTop: 6, fontSize: '0.85rem' }}>
                                      Admin ID: {user.adminId}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {ROLE_CHOICES.map((role) => (
                                      <label
                                        key={role.value}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 8,
                                          fontSize: '0.9rem',
                                          cursor: 'pointer',
                                          opacity: 0.95,
                                        }}
                                      >
                                        <input
                                          type="radio"
                                          name={`role-${user.id}`}
                                          value={role.value}
                                          checked={currentRole === role.value}
                                          onChange={() => handleRoleChange(user.id, role.value)}
                                        />
                                        <span>{role.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  <button
                                    className="btn btn-primary"
                                    disabled={savingUserId === user.id || !hasChanges}
                                    onClick={() => handleSave(user.id)}
                                  >
                                    {savingUserId === user.id ? 'Saving…' : 'Save role'}
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </RoleGuard>
    </ProtectedRoute>
  )
}