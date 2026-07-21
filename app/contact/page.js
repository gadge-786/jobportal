export const metadata = {
  title: 'Contact Us | JobsIndia',
  description: 'Get in touch with JobsIndia team for queries, feedback or advertisement opportunities.',
}

export default function Contact() {
  return (
    <div style={{maxWidth:'700px', margin:'0 auto', padding:'40px 20px'}}>
      <h1 style={{fontSize:'28px', fontWeight:'bold', color:'#111827', marginBottom:'12px'}}>Contact Us</h1>
      <p style={{color:'#4b5563', fontSize:'15px', lineHeight:'1.7', marginBottom:'28px'}}>
        We would love to hear from you. Whether you have a question about a job listing, feedback about our website, or are interested in advertising opportunities, feel free to reach out.
      </p>

      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'20px'}}>
        <h2 style={{fontSize:'16px', fontWeight:'600', color:'#111827', marginBottom:'14px'}}>Get in Touch</h2>

        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <span style={{fontSize:'20px'}}>📧</span>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280'}}>Email</div>
              <div style={{fontSize:'14px', color:'#111827', fontWeight:'500'}}>dwarsing.contact@gmail.com
            </div>
            </div>
          </div>

          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <span style={{fontSize:'20px'}}>📍</span>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280'}}>Location</div>
              <div style={{fontSize:'14px', color:'#111827', fontWeight:'500'}}>Maharashtra, India</div>
            </div>
          </div>

          <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
            <span style={{fontSize:'20px'}}>⏰</span>
            <div>
              <div style={{fontSize:'12px', color:'#6b7280'}}>Response Time</div>
              <div style={{fontSize:'14px', color:'#111827', fontWeight:'500'}}>Within 24-48 hours</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'20px'}}>
        <h2 style={{fontSize:'16px', fontWeight:'600', color:'#111827', marginBottom:'8px'}}>📢 Interested in Advertising?</h2>
        <p style={{fontSize:'14px', color:'#4b5563', lineHeight:'1.6'}}>
          JobsIndia reaches job seekers looking for government and private sector opportunities across India. If you would like to advertise your coaching institute, company, or service on our platform, email us at dwarsing.contact@gmail.com
         with the subject line &quot;Advertisement Inquiry.&quot;
        </p>
      </div>
    </div>
  )
}