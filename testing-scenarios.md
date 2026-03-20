# Testing Maps App

## Landing Page
### Navigation
- [ ] Logo redirects to Home
- [ ] Sign In / Go to Workspace CTA logic
- [ ] Responsive mobile menu
### Hero Section
- [ ] 'Get Started' redirect for guests
- [ ] 'Go to Workspace' redirect for users
- [ ] Visual animations (fade-in, slide-in)
### Branding
- [ ] Beta badge visibility (next to text)
- [ ] Beta warning visibility (hero bottom)

## Authentication
### Google OAuth
- [ ] Account selection popup forced
- [ ] Automated redirect to /workspace on success
- [ ] Error handling for cancelled auth
### Email & Password
- [ ] Sign In validation
- [ ] Sign Up new account
- [ ] Logout from user menu
### Password Reset
- [ ] Forgot password email request
- [ ] Reset password page ('/auth/reset-password')
- [ ] Password update success flow

## Workspace
### Map Management
- [ ] Create New Map modal
- [ ] List existing maps in dropdown
- [ ] Switch between maps (active state)
- [ ] Import Markdown file
### Canvas Interactions
- [ ] Node Creation (Tab / Click)
- [ ] Node Deletion (Delete / Backspace)
- [ ] Drag & Drop (Reparenting)
- [ ] Edit Node Content (Double-click)
- [ ] Zoom & Pan
### State Management
- [ ] Undo / Redo actions
- [ ] Auto-save state
- [ ] Initial empty state hero visibility

## Global UI
### Theme & Layout
- [ ] Light/Dark mode follows OS
- [ ] No UI overlaps (islands vs menu)
- [ ] Floating islands hidden in Markdown View
### Error Handling
- [ ] 404 page for invalid routes
- [ ] Global error boundary for crashes
