import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

export interface TeacherTranslation {
  id: number;
  teacher_id: number;
  language_code: string;
  first_name: string;
  last_name: string;
  address: string;
  grad: string;
  department: string;
}


export interface Teacher {
  id: number;
  cin: string;
  email: string;
  phone_number: string;
  birth_date: Date; 
  cv: string | null;
  created_at?: Date;
  is_deleted?: boolean;
  translations: TeacherTranslation[];
}
export interface CombinedTeacherLocalized extends Omit<Teacher, 'translations'> {
  id: number;
  cin: string;
  email: string;
  phone_number: string;
  birth_date: Date;
  cv: string | null;
  first_name: string;
  last_name: string;
  address: string;
  grad: string;
  grad_fr: string;
  department: string;
  department_fr: string;
  address_fr: string;
  first_name_ar?: string;
  last_name_ar?: string;
  address_ar?: string;
  grad_ar?: string;
  department_ar?: string;
}



@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  
  
  private apiUrl = `${environment.apiUrl}/teachers`;
  private currentLanguage: BehaviorSubject<string> = new BehaviorSubject<string>('fr');

  constructor(private http: HttpClient, private translate: TranslateService) {
    this.translate.onLangChange.subscribe(event => {
      this.currentLanguage.next(event.lang);
    });}

  getTeachers(): Observable<CombinedTeacherLocalized[]> {
    return this.currentLanguage.pipe(
      switchMap(lang => {
        return this.http.get<CombinedTeacherLocalized[]>(this.apiUrl, {
          params: { lang }
        });
      })
    );
  }

  getTeacher(id: number): Observable<CombinedTeacherLocalized> {
    return this.currentLanguage.pipe(
      switchMap(lang => {
        return this.http.get<CombinedTeacherLocalized>(`${this.apiUrl}/${id}`, {
          params: { lang }
        });
      })
    );
  }
  

 create(formData: FormData): Observable<Teacher> {
  return this.http.post<{ code: number; message: string; data: Teacher }>(
    `${environment.apiUrl}/teachers`,
    formData
  ).pipe(
    map(response => response.data)
  );
}



 update(id: number, formData: FormData) {
  // Laravel parses files reliably with POST multipart + _method=PUT
  if (!formData.has('_method')) {
    formData.append('_method', 'PUT');
  }
  return this.http.post<{ code: number; message: string; data: any; errors: any }>(
    `${this.apiUrl}/${id}`,
    formData
  );
}



  delete(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/teachers/${id}`);
  }

  // teacher.service.ts
downloadTeacherPdf(id: number, lang: string) {
  return this.http.get(`${this.apiUrl}/${id}/pdf/${lang}`, {
    // Correct typing for Angular HttpClient
    responseType: 'blob' as 'json',
    observe: 'response'
  }).pipe(
    // If backend ever sends JSON (e.g., an error) with 200/4xx,
    // don't try to download it as a PDF
    map(res => {
      const contentType = res.headers.get('content-type') ?? '';
      const body = res.body as unknown as Blob;

      if (contentType.includes('application/json')) {
        // Backend returned JSON (probably an error message)
        throw new Error('Server returned JSON instead of PDF');
      }

      // Force the correct mime type for safety
      return new Blob([body], { type: 'application/pdf' });
    })
  );
}



downloadTeacherCv(teacherId: number): Observable<Blob> {
  return this.http.get(`${environment.apiUrl}/teachers/${teacherId}/download-cv`, {
    responseType: 'blob',
    observe: 'response'
  }).pipe(
    tap(response => {
      if (!(response.body instanceof Blob)) {
        throw new Error('Invalid file data');
      }
    }),
    map(response => response.body as Blob),
    catchError(error => {
      if (error.error instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const errMsg = JSON.parse(e.target?.result as string);
          console.error('Server error:', errMsg.error);
        };
        reader.readAsText(error.error);
      }
      throw error;
    })
  );
}

search(filters: any): Observable<Teacher[]> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key] !== null && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    }

    return this.http.get<{ code: number; message: string; data: Teacher[] }>(
      `${environment.apiUrl}/teachers/search`, { params }
    ).pipe(map(response => response.data));
  }
// Removed custom tap function; using rxjs/operators tap instead.
}

