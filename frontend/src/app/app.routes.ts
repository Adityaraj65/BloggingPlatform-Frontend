import { Routes } from '@angular/router';
import { Home } from './features/public/home/home';
import { PostDetail } from './features/public/post-detail/post-detail';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/author/dashboard/dashboard';
import { PostEditor } from './features/author/post-editor/post-editor';
import { Profile } from './features/author/profile/profile';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'post/:slug', component: PostDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'author/dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'author/editor', component: PostEditor, canActivate: [authGuard] },
  { path: 'author/editor/:id', component: PostEditor, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
