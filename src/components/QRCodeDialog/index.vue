<template>
    <div>
      <button @click="openQRCodeDialog">显示二维码</button>
  
      <!-- Custom Dialog for QR Code -->
      <div v-if="qrcodeDialogVisible" class="custom-dialog-overlay">
        <div class="custom-dialog">
          <div class="custom-dialog-header">
            <span class="dialog-title">二维码</span>
            <button @click="closeQRCodeDialog" class="close-button">×</button>
          </div>
          <div class="custom-dialog-body">
            <img :src="qrcode" alt="QR Code" class="qrcode-image" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        qrcodeDialogVisible: false,  // Control the visibility of the dialog
        qrcode: '',                  // Store the QR code image URL
      };
    },
    methods: {
      // Open the QR Code dialog
      openQRCodeDialog() {
        this.qrcodeDialogVisible = true;
        // Assume we have a function to get the QR code image URL
        this.getQRCode(); 
      },
      // Close the QR Code dialog
      closeQRCodeDialog() {
        this.qrcodeDialogVisible = false;
      },
      // Replace with your actual logic to fetch the QR code image
      getQRCode() {
        // Example QR code URL, replace with actual QR code fetching logic
        this.qrcode = 'https://www.example.com/qrcode.png';
      },
    },
  };
  </script>
  
  <style scoped>
  /* Overlay for the custom dialog */
  .custom-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);  /* Semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  /* Custom Dialog Box */
  .custom-dialog {
    background: #fff;
    border-radius: 8px;
    width: 350px;
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: fadeIn 0.3s ease-out;
  }
  
  /* Dialog Header */
  .custom-dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #007bff;
    color: white;
    font-size: 18px;
    font-weight: bold;
  }
  
  /* Close Button */
  .close-button {
    background: transparent;
    border: none;
    font-size: 22px;
    color: white;
    cursor: pointer;
  }
  
  .close-button:hover {
    color: #f8f8f8;
  }
  
  /* Dialog Body */
  .custom-dialog-body {
    padding: 16px;
    text-align: center;
  }
  
  /* QR Code Image Style */
  .qrcode-image {
    width: 100%;
    height: auto;
    border-radius: 8px;
    border: 1px solid #eee;
  }
  
  /* Animation for dialog fade-in effect */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  </style>
  