// OTAFileUpload
import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import "../../../styles/pages/management-pages.css"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
const MAX_FILE_BYTES = 50 * 1024 * 1024; // keep in sync with server if possible
const allowedExt = /\.(bin|ota|hex)$/i;

// Device Type mapping: Backend code -> Frontend display name
const DEVICE_TYPES = {
  'OD': 'Odour Device',
  'THD': 'Temperature Humidity Device',
  'AQID': 'AQI Device',
  'GLD': 'Gas Leakage Device',
  'ED': 'Energy Device'
};

const OTAFileUpload = ({ onUploadSuccess}) => {
  const [otaVersionId, setOtaVersionId] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleVersionChange = (e) => setOtaVersionId(e.target.value);
  const handleDeviceTypeChange = (e) => setDeviceType(e.target.value);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) selectFile(files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) selectFile(e.target.files[0]);
  };

  const selectFile = (file) => {
    if (!allowedExt.test(file.name)) {
      Swal.fire({ title: "Invalid file", text: "Only .bin, .ota or .hex files are allowed", icon: "error" });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      Swal.fire({ title: "File too large", text: `Max ${MAX_FILE_BYTES / (1024*1024)} MB allowed`, icon: "error" });
      return;
    }
    setSelectedFile(file);
  };

  const handleBrowseClick = () => fileInputRef.current?.click();

  const safeParseJson = async (res) => {
    const ct = res.headers.get?.('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return null; }
    }
    return null;
  };

  const handleSave = async () => {
    if (!deviceType) {
      Swal.fire({ title: 'Error', text: 'Please select a device type', icon: 'error' });
      return;
    }
    if (!otaVersionId.trim()) {
      Swal.fire({ title: 'Error', text: 'Please enter OTA Version ID', icon: 'error' });
      return;
    }
    if (!selectedFile) {
      Swal.fire({ title: 'Error', text: 'Please select a file to upload', icon: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('version', otaVersionId.trim());
      formData.append('deviceType', deviceType); // ✅ Add device type

      const res = await fetch(`${BASE}/ota/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await safeParseJson(res);

      if (res.status === 201) {
        Swal.fire({ title: 'Success', text: data?.message || 'OTA uploaded successfully', icon: 'success' });
        // reset
        setOtaVersionId('');
        setDeviceType('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (typeof onUploadSuccess === 'function') onUploadSuccess();
      } else if (res.status === 409) {
        // Duplicate versionId
        Swal.fire({ title: 'Conflict', text: data?.message || 'Version ID already exists', icon: 'warning' });
      } else if (res.status === 400) {
        // Bad request (missing versionId or file)
        Swal.fire({ title: 'Bad Request', text: data?.message || 'Missing or invalid fields', icon: 'error' });
      } else if (res.status >= 500) {
        Swal.fire({ title: 'Server error', text: data?.message || 'Server error while uploading', icon: 'error' });
      } else {
        // Fallback for other codes
        Swal.fire({ title: 'Upload failed', text: data?.message || res.statusText || 'Unknown error', icon: 'error' });
      }
    } catch (err) {
      console.error('OTA upload error:', err);
      Swal.fire({ title: 'Network error', text: err.message || 'Could not reach server', icon: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setOtaVersionId('');
    setDeviceType('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };




  return (
    <div className={`AddingPage  brand-add-container  rounded-xl lg:rounded-l-none lg:rounded-r-xl shadow-sm w-full flex flex-col justify-center bg- border border-[#E5E7EB] `}>
      <h2 className="brand-add-title font-semibold mb-5 text-center">Update Devices</h2>
      {/* <p className="brand-add-subtitle text-gray-500 mb-6 text-center">Upload OTA binary and set version id</p> */}

      <div className="brand-add-form space-y-4 max-w-sm mx-auto w-full">
        {/* ✅ Device Type Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Device Type</label>
          <select
            value={deviceType}
            onChange={handleDeviceTypeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          >
            <option value="">Select Device Type</option>
            {Object.entries(DEVICE_TYPES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">OTA Version ID</label>
          <input
            type="text"
            value={otaVersionId}
            onChange={handleVersionChange}
            placeholder="Enter Version (Eg. 3-05-12)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500">Eg. 3-05-12</p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-3 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-[#14B8A6]'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ backgroundColor: isDragging ? '#E6FFFA' : '#14B8A6', minHeight: '200px' }}
        >
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept=".bin,.hex,.ota" disabled={isUploading} />

          <div className="flex flex-col items-center justify-center text-white">
            <Upload className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium mb-2">Drag & Drop to Upload File</p>
            <p className="text-sm mb-4">OR</p>
            <button type="button" onClick={handleBrowseClick} className="px-6 py-2 bg-white text-[#14B8A6] rounded-md font-medium hover:bg-gray-50 transition-colors" disabled={isUploading}>
              Browse File
            </button>
          </div>

          {selectedFile && (
            <div className="mt-4 text-center text-white">
              <p className="text-sm">Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition duration-300 shadow-md" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Save'}
          </button>
          <button type="button" onClick={handleCancel} className="flex-1 bg-white hover:bg-gray-50 text-red-600 font-semibold py-2.5 px-4 rounded-md border border-red-600 transition duration-300" disabled={isUploading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTAFileUpload;
