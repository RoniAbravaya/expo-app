// user-management.tsx for Expo Admin App
// List/search users, view user details (profile, favorites, subscription status)

import { addDoc, collection, deleteDoc, doc, DocumentData, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, List, Portal, Text, TextInput, Title } from 'react-native-paper';
import { useAdmin } from './_layout';

export default function UserManagementScreen() {
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DocumentData | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const { isAdmin, user: adminUser } = useAdmin();
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    const db = getFirestore();
    getDocs(collection(db, 'users')).then((snap) => {
      setUsers(snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [isAdmin]);

  const filteredUsers = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const writeAuditLog = async (action: string, details: string) => {
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'user_audit_logs'), {
        userId: selectedUser?.uid,
        adminId: adminUser?.uid,
        action,
        timestamp: Date.now(),
        details,
      });
    } catch (e) {
      // Optionally show a toast or log error
      console.warn('Failed to write audit log:', e);
    }
  };

  const handleRoleChange = async (newRole: 'admin' | 'user') => {
    if (!selectedUser) return;
    setRoleLoading(true);
    setRoleError(null);
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'users', selectedUser.uid), { role: newRole });
      setSelectedUser({ ...selectedUser, role: newRole });
      setUsers(users.map(u => u.uid === selectedUser.uid ? { ...u, role: newRole } : u));
      await writeAuditLog('role_change', `Changed role to ${newRole}`);
    } catch (e: any) {
      setRoleError(e.message);
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDisableToggle = async () => {
    if (!selectedUser) return;
    setDisableLoading(true);
    setDisableError(null);
    try {
      const db = getFirestore();
      const newDisabled = !selectedUser.disabled;
      await updateDoc(doc(db, 'users', selectedUser.uid), { disabled: newDisabled });
      setSelectedUser({ ...selectedUser, disabled: newDisabled });
      setUsers(users.map(u => u.uid === selectedUser.uid ? { ...u, disabled: newDisabled } : u));
      await writeAuditLog(newDisabled ? 'disable_user' : 'enable_user', `User ${newDisabled ? 'disabled' : 'enabled'}`);
    } catch (e: any) {
      setDisableError(e.message);
    } finally {
      setDisableLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', selectedUser.uid));
      setUsers(users.filter(u => u.uid !== selectedUser.uid));
      setDetailVisible(false);
      await writeAuditLog('delete_user', 'User deleted');
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title>User Management</Title>
      <TextInput
        label="Search by name or email"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <List.Item
              title={item.displayName || item.email}
              description={item.email}
              onPress={() => {
                setSelectedUser(item);
                setDetailVisible(true);
              }}
              right={() => <Text>{item.role === 'admin' ? 'Admin' : 'User'}</Text>}
            />
          )}
        />
      )}
      <Portal>
        <Dialog visible={detailVisible} onDismiss={() => setDetailVisible(false)}>
          <Dialog.Title>User Details</Dialog.Title>
          <Dialog.Content>
            {selectedUser && (
              <>
                <Text>Name: {selectedUser.displayName || 'N/A'}</Text>
                <Text>Email: {selectedUser.email}</Text>
                <Text>Role: {selectedUser.role || 'user'}</Text>
                <Text>Subscription: {selectedUser.subscription?.active ? 'Active' : 'Inactive'}</Text>
                <Text>Status: {selectedUser.disabled ? 'Disabled' : 'Active'}</Text>
                {/* Add more details as needed */}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {selectedUser && selectedUser.role !== 'admin' && (
              <Button loading={roleLoading} onPress={() => handleRoleChange('admin')}>Promote to Admin</Button>
            )}
            {selectedUser && selectedUser.role === 'admin' && (
              <Button loading={roleLoading} onPress={() => handleRoleChange('user')}>Demote to User</Button>
            )}
            {selectedUser && (
              <Button loading={disableLoading} onPress={handleDisableToggle}>
                {selectedUser.disabled ? 'Enable User' : 'Disable User'}
              </Button>
            )}
            {selectedUser && (
              <Button loading={deleteLoading} onPress={() => setDeleteConfirm(true)} color="red">
                Delete User
              </Button>
            )}
            <Button onPress={() => setDetailVisible(false)}>Close</Button>
          </Dialog.Actions>
          {roleError && <Text style={{ color: 'red', marginTop: 8 }}>{roleError}</Text>}
          {disableError && <Text style={{ color: 'red', marginTop: 8 }}>{disableError}</Text>}
          {deleteError && <Text style={{ color: 'red', marginTop: 8 }}>{deleteError}</Text>}
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={deleteConfirm} onDismiss={() => setDeleteConfirm(false)}>
          <Dialog.Title>Confirm Delete</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this user? This cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirm(false)}>Cancel</Button>
            <Button loading={deleteLoading} onPress={handleDelete} color="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  search: {
    marginBottom: 16,
  },
}); 