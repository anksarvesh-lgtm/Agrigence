
export const EMAIL_TEMPLATES = {
  PAYMENT_SUCCESS: {
    subject: "Payment Received - Agrigence",
    body: (data: any) => `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FDFCFB;">
        <div style="text-align: center; margin-bottom: 40px;">
           <h1 style="color: #3D2B1F; margin: 0; font-family: 'Playfair Display', serif; font-size: 32px;">Agrigence</h1>
           <p style="color: #C29263; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px; font-weight: bold;">Official Receipt</p>
        </div>
        
        <div style="background-color: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(61, 43, 31, 0.05);">
            <p style="margin-top: 0; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
            <p style="color: #666; line-height: 1.6;">We have successfully received your payment details. Your subscription request is now being processed by our accounts team.</p>
            
            <div style="background-color: #F9F8F7; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px solid #E5E1DD;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Plan</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #3D2B1F;">${data.plan}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #3D2B1F;">₹${data.amount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Transaction ID</td>
                        <td style="padding: 8px 0; text-align: right; font-family: monospace; color: #C29263;">${data.txnId}</td>
                    </tr>
                </table>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 0;">Verification typically takes up to 12 hours. You will receive a confirmation once your plan is active.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Agrigence Journal. All rights reserved.</p>
            <p>H.N.130, JUDAHARADHAN BHAG-1, Juda haradhan, P.S.-Baluwa, Tahshil-Sakaldiha, Dist.- Chandauli, Uttar Pradesh, India , 221115</p>
        </div>
      </div>
    `
  },
  SUBMISSION_RECEIVED: {
    subject: "Submission Received - Agrigence",
    body: (data: any) => `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FDFCFB;">
        <div style="text-align: center; margin-bottom: 40px;">
           <h1 style="color: #3D2B1F; margin: 0; font-family: 'Playfair Display', serif; font-size: 32px;">Agrigence</h1>
           <p style="color: #C29263; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px; font-weight: bold;">Submission Protocol</p>
        </div>
        
        <div style="background-color: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(61, 43, 31, 0.05);">
            <p style="margin-top: 0; font-size: 16px;">Dear <strong>${data.name}</strong>,</p>
            <p style="color: #666; line-height: 1.6;">Your manuscript has been successfully uploaded to our secure repository. It has now been queued for initial editorial review.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 20px; background-color: #F9F8F7; border-radius: 12px; border: 1px solid #E5E1DD; width: 80%;">
                    <p style="margin: 0 0 5px 0; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Article Title</p>
                    <p style="margin: 0; font-family: 'Playfair Display', serif; font-size: 18px; font-weight: bold; color: #3D2B1F;">${data.title}</p>
                    <div style="height: 1px; background-color: #E5E1DD; margin: 15px 0;"></div>
                    <p style="margin: 0 0 5px 0; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Reference ID</p>
                    <p style="margin: 0; font-family: monospace; color: #C29263;">${data.id}</p>
                </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 0;">You can track the live status of your submission in your <a href="https://agrigence.com/#/dashboard" style="color: #C29263; text-decoration: none; font-weight: bold;">Researcher Dashboard</a>.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Agrigence Editorial Board.</p>
        </div>
      </div>
    `
  },
  STATUS_UPDATE: {
    subject: "Status Update: Your Submission",
    body: (data: any) => `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #FDFCFB;">
        <div style="text-align: center; margin-bottom: 40px;">
           <h1 style="color: #3D2B1F; margin: 0; font-family: 'Playfair Display', serif; font-size: 32px;">Agrigence</h1>
           <p style="color: #C29263; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px; font-weight: bold;">Editorial Notification</p>
        </div>
        
        <div style="background-color: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(61, 43, 31, 0.05);">
            <p style="margin-top: 0; font-size: 16px;">Dear Author,</p>
            <p style="color: #666; line-height: 1.6;">The status of your submission <strong>"${data.title}"</strong> has been updated by our review committee.</p>
            
            <div style="background-color: ${data.status === 'Approved' ? '#F0FDF4' : data.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB'}; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px solid ${data.status === 'Approved' ? '#DCFCE7' : data.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7'}; text-align: center;">
                <p style="margin: 0 0 5px 0; color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">New Status</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${data.status === 'Approved' ? '#166534' : data.status === 'Rejected' ? '#991B1B' : '#92400E'}; text-transform: uppercase;">${data.status}</p>
            </div>

            <p style="font-weight: bold; font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 5px;">Reviewer Remarks:</p>
            <p style="background-color: #F9F8F7; padding: 15px; border-radius: 8px; font-style: italic; color: #555; margin-top: 0;">"${data.remarks || 'No specific remarks provided.'}"</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; margin-bottom: 0;">Please log in to your dashboard for further actions or to download your certificate if applicable.</p>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Agrigence Review Committee.</p>
        </div>
      </div>
    `
  }
};
