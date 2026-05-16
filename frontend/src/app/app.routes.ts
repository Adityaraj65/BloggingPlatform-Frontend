import { Routes } from '@angular/router';
import { Home } from './features/public/home/home';
import { PostDetail } from './features/public/post-detail/post-detail';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { OAuthSuccess } from './features/auth/oauth-success/oauth-success';
import { OAuthRoleSelection } from './features/auth/oauth-role-selection/oauth-role-selection';
import { VerifyEmail } from './features/auth/verify-email/verify-email';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Dashboard } from './features/author/dashboard/dashboard';
import { PostEditor } from './features/author/post-editor/post-editor';
import { Profile } from './features/author/profile/profile';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'post/:slug', component: PostDetail },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'oauth-success', component: OAuthSuccess },
  { path: 'oauth-role-selection', component: OAuthRoleSelection },
  { path: 'author/dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'author/editor', component: PostEditor, canActivate: [authGuard] },
  { path: 'author/editor/:id', component: PostEditor, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
