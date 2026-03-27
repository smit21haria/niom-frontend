import { useState } from 'react';

const sectionHead = {
  fontFamily: 'var(--display-font)',
  fontSize: '22px',
  fontWeight: 600,
  color: 'var(--green)',
};

const tabLabel = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
};

function Label({ children }) {
  return <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>;
}

export default function AdminProfile() {
  const [form, setForm] = useState({
    firmName: 'Niom Wealth Management',
    arn: 'ARN-XXXXX',
    email: 'niom@admin.com',
    phone: '+91 98765 43210',
    website: 'www.niomfintech.in',
    address: 'Mumbai, Maharashtra',
    amfiReg: 'AMFI-REG-XXXXX',
    emailSignature: 'Warm regards,\nNiom Wealth Management',
  });
  const [saved, setSaved] = useState(false);

  const update = (key, val) => { setForm(f => ({ ...f, [key]: val })); setSaved(false); };

  const handleSave = () => setSaved(true);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Admin Profile
        </h1>
      </div>

      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Firm Details</span>
        </div>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <Label>Firm Name</Label>
              <input value={form.firmName} onChange={e => update('firmName', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <Label>Principal ARN</Label>
              <input value={form.arn} onChange={e => update('arn', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <Label>Email Address</Label>
              <input value={form.email} onChange={e => update('email', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <Label>Website</Label>
              <input value={form.website} onChange={e => update('website', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <Label>AMFI Registration No.</Label>
              <input value={form.amfiReg} onChange={e => update('amfiReg', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Address</Label>
              <input value={form.address} onChange={e => update('address', e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Email Signature</Label>
              <textarea value={form.emailSignature} onChange={e => update('emailSignature', e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          {/* Logo + photo upload */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            {['Firm Logo', 'Admin Photo'].map(label => (
              <div key={label}>
                <Label>{label}</Label>
                <div style={{
                  border: '2px dashed var(--border)', borderRadius: '10px',
                  padding: '24px', textAlign: 'center', background: 'var(--sage)',
                }}>
                  <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '10px' }}>
                    Drag & drop or browse
                  </div>
                  <label style={{
                    display: 'inline-block', padding: '8px 20px',
                    borderRadius: '8px', background: 'var(--green)',
                    color: 'var(--ivory)', fontSize: '12px',
                    fontWeight: 500, cursor: 'pointer', letterSpacing: '0.06em',
                  }}>
                    Upload
                    <input type="file" accept="image/*" style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleSave} style={{
              padding: '11px 28px', borderRadius: '8px',
              background: 'var(--green)', color: 'var(--ivory)',
              border: 'none', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', letterSpacing: '0.06em', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
            >Save Changes</button>
            {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
}