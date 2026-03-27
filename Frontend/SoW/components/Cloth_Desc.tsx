import React, { useState } from 'react';
import { View, Text, Image, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ImageStyle, ImageResizeMode } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Update the props interface to include image styling options
export interface ClothingAnalysisDisplayProps {
  imageUri: string;
  analysisData: string;
  isVisible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (editedData: string) => void;
  // Add new props for image styling
  imageStyle?: ImageStyle;
  imageResizeMode?: ImageResizeMode;
}

const ClothingAnalysisDisplay: React.FC<ClothingAnalysisDisplayProps> = ({
  imageUri,
  analysisData,
  isVisible,
  isLoading,
  onClose,
  onSave,
  // Add default values for the new props
  imageStyle = {},
  imageResizeMode = "contain"
}) => {
  const [editedData, setEditedData] = useState(analysisData);
  const [isEditing, setIsEditing] = useState(false);

  // Reset edited data when analysis data changes
  React.useEffect(() => {
    setEditedData(analysisData);
  }, [analysisData]);

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={26} color="#000" />
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            {/* Apply the custom image style and resize mode */}
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, imageStyle]}
              resizeMode={imageResizeMode}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#714463" />
              <Text style={styles.loadingText}>Analyzing your clothing...</Text>
            </View>
          ) : (
            <>
              <View style={styles.analysisContainer}>
                <Text style={styles.sectionTitle}>Clothing Analysis</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    multiline
                    value={editedData}
                    onChangeText={setEditedData}
                  />
                ) : (
                  <Text style={styles.analysisText}>{editedData}</Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setEditedData(analysisData);
                        setIsEditing(false);
                      }}
                    >
                      <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton]}
                      onPress={handleSave}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                                      <TouchableOpacity
                      style={[styles.button, styles.proceedButton]}
                      onPress={onClose}
                    >
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 3,
    top: 4,
    zIndex: 1,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
    lineHeight: 29,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    marginTop: 15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  analysisContainer: {
    marginBottom: 20,
    minHeight: 160,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#714463',
  },
  scrollContainer: {
    flex: 1,
    maxHeight: 150, // This controls how much space the scrollable area can take
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 190,
    maxHeight: 290, 
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#714463',
  },
  proceedButton: {
    backgroundColor: '#4CAF50', // Green color for proceed button
  },
  saveButton: {
    backgroundColor: '#714463',
  },
  cancelButton: {
    backgroundColor: '#e8ccb9',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#714463',
  },
});

export default ClothingAnalysisDisplay;
