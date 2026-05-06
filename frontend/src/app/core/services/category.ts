import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/categories';

export interface CategoryDTO {
  categoryId?: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface TagDTO {
  tagId?: number;
  name: string;
  slug: string;
  usageCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Category {
  private http = inject(HttpClient);

  // ================= CATEGORIES =================
  getAllCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${API_URL}/all`);
  }

  getCategoryById(id: number): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(`${API_URL}/id/${id}`);
  }

  getCategoryBySlug(slug: string): Observable<CategoryDTO> {
    return this.http.get<CategoryDTO>(`${API_URL}/slug/${slug}`);
  }

  createCategory(category: CategoryDTO): Observable<CategoryDTO> {
    return this.http.post<CategoryDTO>(API_URL, category);
  }

  updateCategory(id: number, category: CategoryDTO): Observable<CategoryDTO> {
    return this.http.put<CategoryDTO>(`${API_URL}/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  // ================= TAGS =================
  getAllTags(): Observable<TagDTO[]> {
    return this.http.get<TagDTO[]>(`${API_URL}/tags/all`);
  }

  getTrendingTags(): Observable<TagDTO[]> {
    return this.http.get<TagDTO[]>(`${API_URL}/tags/trending`);
  }

  createTag(tag: TagDTO): Observable<TagDTO> {
    return this.http.post<TagDTO>(`${API_URL}/tags`, tag);
  }

  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tags/${id}`);
  }
}
