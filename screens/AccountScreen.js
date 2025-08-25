import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert, ActivityIndicator, Dimensions, Platform } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../utils/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "firebase/auth";
import LoadingButton from "../components/Loaders/LoadingButton";
import { useAuthFeedback } from "../context/AuthFeedbackContext";
import { getErrorMessage, getErrorTitle } from "../utils/errorHandler";

const { width, height } = Dimensions.get("window");

export default function AccountScreen({ navigation }) {
  const { user, logout, uploadImageToCloudinary, completeProfile } =
    useContext(AuthContext);
  const { showAuthFeedback } = useAuthFeedback();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [optimisticAvatarUrl, setOptimisticAvatarUrl] = useState(null);
  const [previousAvatarUrl, setPreviousAvatarUrl] = useState(null);

  const toggleLogoutModal = () => {
    setLogoutModalVisible((s) => !s);
  };

  const confirmLogout = async () => {
    // Use context logout to ensure token clearing etc.
    try {
      await logout();
    } catch (err) {
      const errorTitle = getErrorTitle('logout');
      const errorMessage = getErrorMessage(err, 'auth');
      showAuthFeedback(errorTitle, errorMessage);
    } finally {
      setLogoutModalVisible(false);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        const errorTitle = getErrorTitle('avatar');
        const errorMessage = "Please allow access to your photos to change your profile picture.";
        showAuthFeedback(errorTitle, errorMessage);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      // Store previous avatar URL for potential rollback
      const currentAvatarUrl = user?.photoURL;
      setPreviousAvatarUrl(currentAvatarUrl);
      
      // Optimistically show the new image immediately
      setOptimisticAvatarUrl(uri);
      
      // Start upload process in background
      setUploadingAvatar(true);
      
      try {
        if (typeof uploadImageToCloudinary === "function") {
          const secureUrl = await uploadImageToCloudinary(uri);
          if (!secureUrl) throw new Error("Upload returned no URL");

          // Update Firebase profile
          await updateProfile(auth.currentUser, { photoURL: secureUrl });

          // Persist in Firestore profile via completeProfile (merge)
          if (typeof completeProfile === "function") {
            await completeProfile({ photoURL: secureUrl });
          }

          // Clear optimistic state and show success
          setOptimisticAvatarUrl(null);
          setPreviousAvatarUrl(null);
          showAuthFeedback("Success", "Profile picture updated.", "success");
        } else {
          // Fallback: update local uri directly on auth profile (not persisted in Cloudinary)
          await updateProfile(auth.currentUser, { photoURL: uri });
          if (typeof completeProfile === "function") {
            await completeProfile({ photoURL: uri });
          }
          
          // Clear optimistic state and show success
          setOptimisticAvatarUrl(null);
          setPreviousAvatarUrl(null);
          showAuthFeedback("Success", "Profile picture updated locally.", "success");
        }
      } catch (err) {
        console.error("Avatar update error:", err);
        
        // Rollback to previous avatar on error
        setOptimisticAvatarUrl(null);
        if (previousAvatarUrl) {
          try {
            await updateProfile(auth.currentUser, { photoURL: previousAvatarUrl });
            if (typeof completeProfile === "function") {
              await completeProfile({ photoURL: previousAvatarUrl });
            }
          } catch (rollbackError) {
            console.error("Rollback error:", rollbackError);
          }
        }
        setPreviousAvatarUrl(null);
        
        const errorTitle = getErrorTitle('avatar');
        const errorMessage = getErrorMessage(err, 'upload');
        showAuthFeedback(errorTitle, errorMessage);
      } finally {
        setUploadingAvatar(false);
      }
    } catch (error) {
      console.error("Pick image error:", error);
      // Clear optimistic state on pick error
      setOptimisticAvatarUrl(null);
      setPreviousAvatarUrl(null);
      
      const errorTitle = getErrorTitle('avatar');
      const errorMessage = getErrorMessage(error, 'upload');
      showAuthFeedback(errorTitle, errorMessage);
    }
  };

  const updateName = async () => {
    if (!newName.trim()) {
      const errorTitle = getErrorTitle('name');
      const errorMessage = "Name cannot be empty. Please enter a valid name.";
      showAuthFeedback(errorTitle, errorMessage);
      return;
    }

    setSavingName(true);
    try {
      // update firebase profile
      await updateProfile(auth.currentUser, { displayName: newName.trim() });

      // update firestore profile
      if (typeof completeProfile === "function") {
        await completeProfile({ displayName: newName.trim() });
      }

      setNameModalVisible(false);
      showAuthFeedback("Success", "Name updated successfully!", "success");
    } catch (error) {
      console.error("Name update error:", error);
      const errorTitle = getErrorTitle('name');
      const errorMessage = getErrorMessage(error, 'profile');
      showAuthFeedback(errorTitle, errorMessage);
    } finally {
      setSavingName(false);
    }
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Attempt to delete auth user. Note: may require recent login.
      await auth.currentUser.delete();

      showAuthFeedback("Account Deleted", "Your account has been permanently deleted.", "success");
      // After deletion, sign out and navigate to Entry
      try {
        await logout();
      } catch (e) {
        // ignore
      }
      // try to send user to Entry or root - navigation behavior handled by AppRoot
      if (navigation && navigation.reset) {
        try {
          navigation.reset({ index: 0, routes: [{ name: "Entry" }] });
        } catch (e) {
          // fallback
          navigation.navigate("Entry");
        }
      }
    } catch (error) {
      console.error("Delete account error:", error);
      const errorTitle = getErrorTitle('delete');
      const errorMessage = getErrorMessage(error, 'account');
      showAuthFeedback(errorTitle, errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.header}>Account</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
            <Image
              source={
                optimisticAvatarUrl
                  ? { uri: optimisticAvatarUrl }
                  : user?.photoURL
                  ? { uri: user.photoURL }
                  : require("../assets/default-avatar.png")
              }
              style={styles.avatar}
            />
            <View style={styles.editIcon}>
              {uploadingAvatar ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="camera" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Avatar</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Name</Text>
            <TouchableOpacity onPress={() => { setNewName(user?.displayName || ""); setNameModalVisible(true); }}>
              <Ionicons name="chevron-forward" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionValue}>{user?.displayName || "Anonymous"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <Text style={styles.sectionValue}>{user?.email}</Text>
          <Text style={styles.captionSmall}>Email change coming soon</Text>
        </View>

        <TouchableOpacity
          style={styles.section}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </View>
          <Text style={styles.sectionDescription}>Change your account password</Text>
        </TouchableOpacity>

        {/* Delete account */}
        <View style={styles.deleteSection}>
          <Text style={styles.sectionTitle}>Delete account</Text>
          <Text style={styles.deleteDescription}>
            Deleting your account is permanent. You will immediately lose access to all your data.
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={toggleLogoutModal}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Name Edit Modal */}
      <Modal
        visible={nameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.nameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="New name"
              autoFocus
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNameModalVisible(false)}
                disabled={savingName}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <LoadingButton
                style={[styles.modalButton, styles.modalPrimaryButton]}
                textStyle={[styles.modalButtonText, { color: "#fff" }]}
                onPress={updateName}
                isLoading={savingName}
                title="OK"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action is permanent and cannot be undone.
            </Text>
            <Text style={styles.modalWarning}>
              All your data will be immediately and permanently deleted.
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <LoadingButton
                style={[styles.modalButton, styles.deleteConfirmButton]}
                textStyle={[styles.modalButtonText, { color: "#fff" }]}
                onPress={confirmDeleteAccount}
                isLoading={isDeleting}
                title="Delete Account"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal
        visible={logoutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalPrimaryButton]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalButtonText, { color: "#fff" }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f6f8fa" },
  container: {
    flex: 1,
    padding: Math.max(16, width * 0.04),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  backButton: { padding: 6 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#e3edf7ff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: Math.round(width * 0.25),
    height: Math.round(width * 0.25),
    borderRadius: Math.round((width * 0.25) / 2),
    borderWidth: 1,
    borderColor: "#eee",
    resizeMode: "cover",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 999,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  caption: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  captionSmall: {
    color: "#999",
    fontSize: 12,
    marginTop: 6,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionValue: {
    fontSize: 16,
    color: "#444",
    marginTop: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
  deleteSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  deleteDescription: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E74C3C",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* modal */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 520,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: "#444",
    marginBottom: 12,
  },
  modalWarning: {
    fontSize: 15,
    color: "#EA4335",
    fontWeight: "600",
    marginBottom: 16,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    marginBottom: 18,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  modalPrimaryButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  deleteConfirmButton: {
    borderColor: "#EA4335",
    backgroundColor: "#EA4335",
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
});
