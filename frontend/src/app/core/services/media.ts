import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/media';

export interface MediaDTO {
  mediaId: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploaderId: number;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class Media {
  private http = inject(HttpClient);

  uploadMedia(file: File, uploaderId: number): Observable<MediaDTO> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaderId', uploaderId.toString());

    return this.http.post<MediaDTO>(`${API_URL}/upload`, formData);
  }

  getMediaById(id: number): Observable<MediaDTO> {
    return this.http.get<MediaDTO>(`${API_URL}/${id}`);
  }

  getAllMedia(): Observable<MediaDTO[]> {
    return this.http.get<MediaDTO[]>(`${API_URL}/all`);
  }

  deleteMedia(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
