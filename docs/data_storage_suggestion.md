# 📦 Data Storage Strategy - EduLearn Platform

> **Tài liệu này cung cấp các phương án lưu trữ tài nguyên (files) cho hệ thống EduLearn.**  
> Backend Developer có thể chọn phương án phù hợp nhất với yêu cầu dự án.

---

## 📊 Tổng Quan Yêu Cầu

| Loại tài nguyên | Dung lượng ước tính | Tần suất truy cập | Ưu tiên |
|-----------------|---------------------|-------------------|---------|
| **PDF/Tài liệu** | Cao (chủ yếu) | Trung bình | ⭐⭐⭐ |
| **Ảnh thumbnail** | Thấp | Cao | ⭐⭐ |
| **Video** | Rất cao | Cao | ⭐⭐⭐ (đã dùng YouTube) |

---

## 🏆 Đề Xuất Chính (Recommended)

### **Option 1: Google Drive 2TB + Cloudinary** ⭐ RECOMMENDED

```
┌─────────────────────────────────────────────────────────────┐
│                    RECOMMENDED STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   📄 PDF/TXT/DOCX          → Google Drive 2TB               │
│   📷 Images (thumbnails)   → Cloudinary 25GB                │
│      • Auto WebP, resize on-the-fly, CDN toàn cầu          │
│   🎬 Videos                → YouTube (existing)              │
│   🗄️ Metadata              → Supabase PostgreSQL            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Chi phí:** $0/tháng  
**Tổng storage:** ~2TB + 25GB  
**Độ phức tạp:** ⭐⭐ (Trung bình)

---

## 📋 Chi Tiết Các Phương Án

---

### 🅰️ **PHƯƠNG ÁN A: Google Drive via Apps Script**

#### Thông tin
| Thuộc tính | Giá trị |
|------------|---------|
| **Storage** | 2TB (tài khoản cá nhân có sẵn) |
| **Bandwidth** | Không giới hạn rõ ràng |
| **Chi phí** | $0 |
| **Phù hợp cho** | PDF, TXT, DOCX, tài liệu lớn |

#### Ưu điểm
- ✅ Storage khổng lồ (2TB) đã có sẵn
- ✅ Miễn phí hoàn toàn
- ✅ Google infrastructure ổn định
- ✅ Preview PDF trực tiếp trong browser

#### Nhược điểm
- ⚠️ Không phải CDN (có thể chậm với traffic lớn)
- ⚠️ Cần setup Apps Script
- ⚠️ Quota giới hạn 20,000 requests/ngày (đủ cho project vừa)
- ⚠️ Không optimize ảnh tự động

#### Cách triển khai

**Bước 1: Tạo Google Apps Script**

```javascript
// File: Code.gs
// Deploy as Web App với quyền "Anyone"

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const folder = DriveApp.getFolderById(params.folderId || 'YOUR_DEFAULT_FOLDER_ID');
    
    // Decode base64 file content
    const blob = Utilities.newBlob(
      Utilities.base64Decode(params.fileData),
      params.mimeType,
      params.fileName
    );
    
    // Create file in Drive
    const file = folder.createFile(blob);
    
    // Set public access
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: file.getId(),
      fileName: file.getName(),
      mimeType: file.getMimeType(),
      size: file.getSize(),
      previewUrl: `https://drive.google.com/file/d/${file.getId()}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
      embedUrl: `https://drive.google.com/file/d/${file.getId()}/preview`
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // List files or get file info
  const action = e.parameter.action;
  
  if (action === 'list') {
    const folderId = e.parameter.folderId;
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const result = [];
    
    while (files.hasNext()) {
      const file = files.next();
      result.push({
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        previewUrl: `https://drive.google.com/file/d/${file.getId()}/preview`
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      files: result
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

**Bước 2: Deploy Apps Script**
1. Vào [script.google.com](https://script.google.com)
2. Tạo project mới, paste code trên
3. Deploy → New deployment → Web app
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Copy URL deployment

**Bước 3: Backend FastAPI Integration**

```python
# app/services/google_drive.py

import base64
import httpx
from typing import Optional
from pydantic import BaseModel

class GoogleDriveService:
    def __init__(self, apps_script_url: str, default_folder_id: str):
        self.apps_script_url = apps_script_url
        self.default_folder_id = default_folder_id
    
    async def upload_file(
        self, 
        file_data: bytes, 
        file_name: str, 
        mime_type: str,
        folder_id: Optional[str] = None
    ) -> dict:
        """Upload file to Google Drive via Apps Script"""
        
        payload = {
            "fileName": file_name,
            "mimeType": mime_type,
            "fileData": base64.b64encode(file_data).decode('utf-8'),
            "folderId": folder_id or self.default_folder_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.apps_script_url,
                json=payload,
                timeout=60.0  # Large files may take time
            )
            return response.json()
    
    async def list_files(self, folder_id: Optional[str] = None) -> dict:
        """List files in a folder"""
        
        params = {
            "action": "list",
            "folderId": folder_id or self.default_folder_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.apps_script_url,
                params=params
            )
            return response.json()


# Usage in endpoint
from fastapi import APIRouter, UploadFile, File

router = APIRouter()
drive_service = GoogleDriveService(
    apps_script_url="YOUR_APPS_SCRIPT_URL",
    default_folder_id="YOUR_FOLDER_ID"
)

@router.post("/upload/document")
async def upload_document(file: UploadFile = File(...)):
    file_data = await file.read()
    result = await drive_service.upload_file(
        file_data=file_data,
        file_name=file.filename,
        mime_type=file.content_type
    )
    return result
```

**Bước 4: Frontend hiển thị PDF**

```tsx
// React component
function PdfViewer({ driveFileId }: { driveFileId: string }) {
  const embedUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
  
  return (
    <iframe
      src={embedUrl}
      className="w-full h-full min-h-[600px]"
      title="PDF Viewer"
      allow="autoplay"
    />
  );
}
```

---

### 🅱️ **PHƯƠNG ÁN B: Supabase Storage Only**

#### Thông tin
| Thuộc tính | Giá trị |
|------------|---------|
| **Storage** | 1GB (free tier) |
| **Bandwidth** | 2GB/tháng |
| **Chi phí** | $0 (free) / $25/tháng (Pro: 100GB) |
| **Phù hợp cho** | Ảnh, files nhỏ, projects nhỏ |

#### Ưu điểm
- ✅ Đã tích hợp sẵn với auth
- ✅ API đơn giản
- ✅ Hỗ trợ signed URLs (private files)
- ✅ CDN qua Supabase Edge

#### Nhược điểm
- ⚠️ Free tier chỉ 1GB (không đủ cho nhiều PDF)
- ⚠️ Bandwidth 2GB/tháng có thể hết nhanh
- ⚠️ Cần upgrade nếu scale

#### Cách triển khai

```python
# app/services/supabase_storage.py

from supabase import create_client, Client
import os

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

async def upload_to_supabase(
    file_data: bytes,
    file_name: str,
    bucket: str = "documents"
) -> dict:
    """Upload file to Supabase Storage"""
    
    # Upload file
    result = supabase.storage.from_(bucket).upload(
        path=file_name,
        file=file_data,
        file_options={"content-type": "application/pdf"}
    )
    
    # Get public URL
    public_url = supabase.storage.from_(bucket).get_public_url(file_name)
    
    return {
        "success": True,
        "url": public_url,
        "path": file_name
    }

async def get_signed_url(file_path: str, bucket: str = "documents") -> str:
    """Get signed URL for private files (expires in 1 hour)"""
    
    result = supabase.storage.from_(bucket).create_signed_url(
        path=file_path,
        expires_in=3600
    )
    return result['signedURL']
```

```tsx
// Frontend
function PdfViewer({ supabaseUrl }: { supabaseUrl: string }) {
  return (
    <iframe
      src={supabaseUrl}
      className="w-full h-full"
      title="PDF Viewer"
    />
  );
}
```

---

### 🅲️ **PHƯƠNG ÁN C: Cloudinary (Chủ yếu cho ảnh)**

#### Thông tin
| Thuộc tính | Giá trị |
|------------|---------|
| **Storage** | 25GB |
| **Bandwidth** | 25GB/tháng |
| **Chi phí** | $0 (free tier) |
| **Phù hợp cho** | Ảnh, thumbnails, banners |

#### Ưu điểm
- ✅ Transform ảnh on-the-fly (resize, crop, WebP)
- ✅ CDN toàn cầu, rất nhanh
- ✅ AI-powered optimization
- ✅ Hỗ trợ cả video (với giới hạn)

#### Nhược điểm
- ⚠️ Không optimize cho PDF
- ⚠️ Free tier có thể hết nếu dùng nhiều transformations
- ⚠️ Cần thêm dependency

#### Cách triển khai

```python
# app/services/cloudinary_service.py

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

cloudinary.config(
    cloud_name = "your_cloud_name",
    api_key = "your_api_key",
    api_secret = "your_api_secret",
    secure = True
)

async def upload_image(file_data: bytes, file_name: str) -> dict:
    """Upload image to Cloudinary"""
    
    result = cloudinary.uploader.upload(
        file_data,
        public_id=file_name,
        folder="edulearn/thumbnails",
        transformation=[
            {"quality": "auto"},
            {"fetch_format": "auto"}
        ]
    )
    
    return {
        "success": True,
        "url": result['secure_url'],
        "public_id": result['public_id'],
        "width": result['width'],
        "height": result['height']
    }

def get_optimized_url(public_id: str, width: int = 400, height: int = 300) -> str:
    """Get optimized image URL with transformations"""
    
    url, _ = cloudinary_url(
        public_id,
        width=width,
        height=height,
        crop="fill",
        quality="auto",
        fetch_format="auto"
    )
    return url
```

```tsx
// Frontend - Cloudinary auto-optimizes
function CourseImage({ publicId }: { publicId: string }) {
  // Cloudinary URL với transformations
  const url = `https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${publicId}`;
  
  return <img src={url} alt="Course thumbnail" />;
}
```

---

### 🅳️ **PHƯƠNG ÁN D: Local Server Storage**

#### Thông tin
| Thuộc tính | Giá trị |
|------------|---------|
| **Storage** | Tùy thuộc server |
| **Bandwidth** | Tùy thuộc server |
| **Chi phí** | $0 (đã có server) |
| **Phù hợp cho** | Development, self-hosted |

#### Ưu điểm
- ✅ Kiểm soát hoàn toàn
- ✅ Không phụ thuộc third-party
- ✅ Không giới hạn API calls

#### Nhược điểm
- ⚠️ Phải tự quản lý backup
- ⚠️ Chậm nếu server yếu hoặc xa user
- ⚠️ Tốn bandwidth server
- ⚠️ Không có CDN

#### Cách triển khai

```python
# app/services/local_storage.py

import os
import aiofiles
from pathlib import Path
from fastapi import UploadFile
from fastapi.staticfiles import StaticFiles

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

async def save_file_locally(
    file: UploadFile,
    subfolder: str = "documents"
) -> dict:
    """Save file to local storage"""
    
    folder = UPLOAD_DIR / subfolder
    folder.mkdir(exist_ok=True)
    
    file_path = folder / file.filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "success": True,
        "path": str(file_path),
        "url": f"/files/{subfolder}/{file.filename}",
        "size": len(content)
    }

# In main.py
from fastapi.staticfiles import StaticFiles

app.mount("/files", StaticFiles(directory="uploads"), name="files")
```

---

### 🅴️ **PHƯƠNG ÁN E: Google Drive API (Direct)**

#### Thông tin
| Thuộc tính | Giá trị |
|------------|---------|
| **Storage** | 2TB (tài khoản cá nhân) |
| **Chi phí** | $0 |
| **Phù hợp cho** | Projects cần control nhiều hơn |

#### Khác biệt với Apps Script
- Dùng Service Account hoặc OAuth 2.0 trực tiếp
- Không qua trung gian Apps Script
- Cần Google Cloud Project

#### Cách triển khai

```python
# app/services/google_drive_api.py

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io

SCOPES = ['https://www.googleapis.com/auth/drive.file']

class GoogleDriveAPIService:
    def __init__(self, service_account_file: str):
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file, 
            scopes=SCOPES
        )
        self.service = build('drive', 'v3', credentials=credentials)
    
    async def upload_file(
        self,
        file_data: bytes,
        file_name: str,
        mime_type: str,
        folder_id: str
    ) -> dict:
        """Upload file using Google Drive API"""
        
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaIoBaseUpload(
            io.BytesIO(file_data),
            mimetype=mime_type,
            resumable=True
        )
        
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, mimeType, size, webViewLink'
        ).execute()
        
        # Make file public
        self.service.permissions().create(
            fileId=file['id'],
            body={'type': 'anyone', 'role': 'reader'}
        ).execute()
        
        return {
            "success": True,
            "fileId": file['id'],
            "name": file['name'],
            "previewUrl": f"https://drive.google.com/file/d/{file['id']}/preview",
            "downloadUrl": f"https://drive.google.com/uc?export=download&id={file['id']}"
        }
```

---

## 📊 So Sánh Tổng Quan

| Tiêu chí | Google Drive (Apps Script) | Supabase Storage | Cloudinary | Local Server |
|----------|---------------------------|------------------|------------|--------------|
| **Free Storage** | 2TB | 1GB | 25GB | Tùy server |
| **Free Bandwidth** | ~Unlimited | 2GB/tháng | 25GB/tháng | Tùy server |
| **Setup Complexity** | ⭐⭐ | ⭐ | ⭐⭐ | ⭐ |
| **PDF Support** | ✅ Excellent | ✅ Good | ⚠️ Limited | ✅ Good |
| **Image Optimization** | ❌ | ❌ | ✅ Excellent | ❌ |
| **CDN** | ⚠️ Google's | ✅ Supabase Edge | ✅ Global | ❌ |
| **Auth Integration** | ⚠️ Manual | ✅ Built-in | ⚠️ Manual | ⚠️ Manual |
| **Scalability** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ |

---

## 🎯 Khuyến Nghị Theo Use Case

### 📚 Project Học Tập (như EduLearn)
```
PDF/Tài liệu  → Google Drive 2TB (via Apps Script)
Ảnh thumbnail → Cloudinary 25GB
Video         → YouTube (existing)
```

### 🏢 Doanh Nghiệp Nhỏ
```
Tất cả files  → Supabase Storage (upgrade Pro $25/tháng nếu cần)
Hoặc          → Google Drive + Cloudinary
```

### 🚀 Startup Scale Lớn
```
Files         → AWS S3 hoặc Cloudflare R2
Images        → Cloudinary
Videos        → YouTube/Vimeo hoặc Mux
```

---

## 🔐 Bảo Mật

### Private Files (Recommended)
- Sử dụng **Signed URLs** với thời hạn ngắn (1-24 giờ)
- Frontend request URL mới khi cần truy cập
- Backend verify user permission trước khi cấp URL

```python
# Example: Protected file access
@router.get("/lessons/{lesson_id}/document")
async def get_lesson_document(
    lesson_id: int,
    current_user: User = Depends(get_current_user)
):
    # Check user has access to this lesson
    if not user_can_access_lesson(current_user, lesson_id):
        raise HTTPException(403, "Access denied")
    
    # Generate signed URL (expires in 1 hour)
    lesson = get_lesson(lesson_id)
    signed_url = generate_signed_url(lesson.file_id, expires_in=3600)
    
    return {"url": signed_url}
```

---

## 📝 Checklist Triển Khai

### Nếu chọn Google Drive + Supabase:
- [ ] Tạo folder riêng trên Google Drive cho project
- [ ] Setup Google Apps Script và deploy
- [ ] Tạo bucket trên Supabase Storage cho images
- [ ] Implement upload service trong FastAPI
- [ ] Test upload/download flow
- [ ] Implement cleanup cho files không dùng

### Environment Variables cần thiết:
```env
# Google Drive
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Supabase (đã có)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 📚 Tài Liệu Tham Khảo

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

> **Ghi chú:** Document này được tạo ngày 18/12/2024. Các pricing và features có thể thay đổi, vui lòng kiểm tra trang chính thức của từng service.
