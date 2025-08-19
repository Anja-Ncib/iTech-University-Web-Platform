import { Routes } from '@angular/router';
import { TeachersComponent } from './pages/teachers/components/teachers/teachers.component';
import { TeacherDetailsComponent } from './pages/showTeacher/components/show/show.component';
import { EditTeacherComponent } from './pages/editTeacher/components/edit/edit.component';
import { AddTeacherComponent } from './pages/addTeacher/components/add/add.component';

export const routes: Routes = [
  {
    path: 'teachers/showTeacher',
    loadComponent: () =>
      import('./pages/showTeacher/components/show/show.component').then(
        (m) => m.TeacherDetailsComponent
      )
  },
  {
    path: 'teachers/editTeacher',
    loadComponent: () =>
      import('./pages/editTeacher/components/edit/edit.component').then(
        (m) => m.EditTeacherComponent
      )
  },
  {
    path: 'teachers/addTeacher',
    loadComponent: () =>
      import('./pages/addTeacher/components/add/add.component').then(
        (m) => m.AddTeacherComponent
      )
  },
  {
    path: 'teachers',
    component: TeachersComponent
  },
  {
    path: '',
    redirectTo: 'teachers',
    pathMatch: 'full'
  },
  { 
    path: 'teachers/:id/show', 
    component:  TeacherDetailsComponent
  },
  {
    path: 'teachers/:id/edit',
    component:  EditTeacherComponent
  },
  {
    path: 'teachers/add',
    component: AddTeacherComponent
  }

];