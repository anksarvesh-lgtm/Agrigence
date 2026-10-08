
import { EMAIL_TEMPLATES } from './templates';
import { mockBackend } from '../../services/mockBackend';

/**
 * Sends a transactional email notification via backend persistence (Firestore Mail Trigger).
 */
export const sendNotification = async (type: keyof typeof EMAIL_TEMPLATES, data: any) => {
  try {
    const template = EMAIL_TEMPLATES[type];
    if (!template) {
      console.warn(`No template found for notification type: ${type}`);
      return;
    }

    if (!data.email) {
        console.warn(`Skipping email notification for ${type}: No email provided.`);
        return;
    }

    const emailBody = template.body(data);

    // Call Backend: This writes to the 'mail' collection in Firestore.
    // If the Firebase "Trigger Email" extension is installed, this will send the actual email.
    await mockBackend.triggerEmail(data.email, template.subject, emailBody);

    // Development Logging
    console.group('%c 📧 [Email Service Triggered]', 'color: #C29263; font-weight: bold; font-size: 12px;');
    console.log(`To: ${data.email}`);
    console.log(`Subject: ${template.subject}`);
    console.groupEnd();

    // Visual Feedback (Toast)
    const toastId = 'email-toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = 'fixed bottom-6 right-6 bg-[#1C1510] text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-4 animate-[slideIn_0.3s_ease-out] border border-white/10';
    toast.innerHTML = `
      <div class="bg-agri-secondary/20 text-agri-secondary p-2 rounded-full"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
      <div>
        <div class="text-[10px] font-black uppercase tracking-widest text-white/40">System Notification</div>
        <div class="text-xs font-bold">Email Dispatch: ${type}</div>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        const el = document.getElementById(toastId);
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(100%)';
            el.style.transition = 'all 0.5s ease';
            setTimeout(() => el.remove(), 500);
        }
    }, 4000);

  } catch (error) {
    console.error("Failed to trigger email service:", error);
  }
};
