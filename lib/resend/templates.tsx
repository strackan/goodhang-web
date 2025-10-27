import * as React from 'react';

// Shared email styles - clean and readable
const baseStyles = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  color: '#333333',
  lineHeight: '1.6',
};

const containerStyles = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '40px 20px',
};

const headerStyles = {
  borderBottom: '3px solid #8b5cf6',
  paddingBottom: '20px',
  marginBottom: '30px',
};

const titleStyles = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#8b5cf6',
  margin: '0 0 10px 0',
};

const buttonStyles = {
  backgroundColor: '#8b5cf6',
  color: '#ffffff',
  padding: '12px 30px',
  textDecoration: 'none',
  borderRadius: '6px',
  display: 'inline-block',
  fontWeight: 'bold',
  marginTop: '20px',
};

const footerStyles = {
  borderTop: '1px solid #e5e5e5',
  marginTop: '40px',
  paddingTop: '20px',
  fontSize: '14px',
  color: '#666666',
};

// ============================================================
// RSVP CONFIRMATION EMAIL
// ============================================================

interface RSVPConfirmationProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  guestName: string;
  plusOnes: number;
  eventUrl: string;
}

export function RSVPConfirmationEmail({
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  guestName,
  plusOnes,
  eventUrl,
}: RSVPConfirmationProps) {
  return (
    <div style={baseStyles}>
      <div style={containerStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={{ ...titleStyles, fontSize: '28px', marginBottom: '5px' }}>
            GOOD HANG
          </h1>
          <p style={{ margin: 0, color: '#666666' }}>You're on the list!</p>
        </div>

        {/* Content */}
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Hey {guestName},
        </p>

        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          You're confirmed for <strong>{eventTitle}</strong>! We're excited to see you there.
        </p>

        {/* Event Details Box */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '15px', color: '#333333' }}>
            Event Details
          </h2>
          <p style={{ margin: '8px 0' }}>
            <strong>📅 Date:</strong> {eventDate}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>🕐 Time:</strong> {eventTime}
          </p>
          <p style={{ margin: '8px 0' }}>
            <strong>📍 Location:</strong> {eventLocation}
          </p>
          {plusOnes > 0 && (
            <p style={{ margin: '8px 0' }}>
              <strong>👥 Guests:</strong> You + {plusOnes}
            </p>
          )}
        </div>

        <a href={eventUrl} style={buttonStyles}>
          View Event Details
        </a>

        <p style={{ fontSize: '16px', marginTop: '30px' }}>
          Need to cancel? Just reply to this email and let us know.
        </p>

        {/* Footer */}
        <div style={footerStyles}>
          <p style={{ margin: '0 0 10px 0' }}>
            Good Hang
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
            An exclusive social club for tech professionals who want more than networking.
          </p>
          <p style={{ margin: 0, fontSize: '12px' }}>
            <a href="https://goodhang.club" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
              goodhang.club
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MEMBERSHIP APPROVED EMAIL
// ============================================================

interface MembershipApprovedProps {
  name: string;
  loginUrl: string;
  directoryUrl: string;
  eventsUrl: string;
}

export function MembershipApprovedEmail({
  name,
  loginUrl,
  directoryUrl,
  eventsUrl,
}: MembershipApprovedProps) {
  return (
    <div style={baseStyles}>
      <div style={containerStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={{ ...titleStyles, fontSize: '28px', marginBottom: '5px' }}>
            GOOD HANG
          </h1>
          <p style={{ margin: 0, color: '#666666' }}>Welcome to the club!</p>
        </div>

        {/* Content */}
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Hey {name},
        </p>

        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '20px' }}>
          🎉 Your membership has been approved!
        </p>

        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          You now have full access to Good Hang. We're excited to have you as part of our community.
        </p>

        {/* What's Next Box */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '15px', color: '#333333' }}>
            What's Next?
          </h2>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
              1. Complete Your Profile
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
              Add your bio, company, and interests so other members can get to know you.
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
              2. Browse the Member Directory
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
              Connect with other tech professionals in the Raleigh area.
            </p>
          </div>

          <div>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
              3. RSVP for Events
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
              Check out our upcoming happy hours, retreats, and experiences.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <a href={loginUrl} style={buttonStyles}>
            Access Your Dashboard
          </a>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <a href={eventsUrl} style={{ ...buttonStyles, backgroundColor: '#ffffff', color: '#8b5cf6', border: '2px solid #8b5cf6' }}>
            Browse Events
          </a>
        </div>

        <p style={{ fontSize: '16px', marginTop: '30px' }}>
          Questions? Just reply to this email. We're here to help!
        </p>

        {/* Footer */}
        <div style={footerStyles}>
          <p style={{ margin: '0 0 10px 0' }}>
            Good Hang
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
            Raleigh · Est. 2025 · Expanding Soon
          </p>
          <p style={{ margin: 0, fontSize: '12px' }}>
            <a href="https://goodhang.club" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
              goodhang.club
            </a>
            {' · '}
            <a href={directoryUrl} style={{ color: '#8b5cf6', textDecoration: 'none' }}>
              Member Directory
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APPLICATION RECEIVED EMAIL
// ============================================================

interface ApplicationReceivedProps {
  name: string;
}

export function ApplicationReceivedEmail({ name }: ApplicationReceivedProps) {
  return (
    <div style={baseStyles}>
      <div style={containerStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <h1 style={{ ...titleStyles, fontSize: '28px', marginBottom: '5px' }}>
            GOOD HANG
          </h1>
          <p style={{ margin: 0, color: '#666666' }}>Application received</p>
        </div>

        {/* Content */}
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Hey {name},
        </p>

        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Thanks for applying to Good Hang! We've received your application and our team is reviewing it.
        </p>

        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '15px', color: '#333333' }}>
            What Happens Next?
          </h2>
          <p style={{ margin: '0 0 10px 0' }}>
            1. We'll review your application within 2-3 business days
          </p>
          <p style={{ margin: '0 0 10px 0' }}>
            2. If it's a good fit, we may reach out for a brief conversation
          </p>
          <p style={{ margin: 0 }}>
            3. Once approved, you'll get instant access to member features
          </p>
        </div>

        <p style={{ fontSize: '16px' }}>
          In the meantime, feel free to browse our upcoming events and learn more about what we're building.
        </p>

        {/* Footer */}
        <div style={footerStyles}>
          <p style={{ margin: '0 0 10px 0' }}>
            Good Hang
          </p>
          <p style={{ margin: 0, fontSize: '12px' }}>
            <a href="https://goodhang.club" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
              goodhang.club
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NOTE: Resend supports React components directly
// No need to render to static markup
// Just export the components and use them directly in API routes
// ============================================================
