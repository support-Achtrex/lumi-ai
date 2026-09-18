const { jsPDF } = require('./frontend/node_modules/jspdf');
const fs = require('fs');
const path = require('path');

function createReportPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryColor = [10, 32, 133];      // #0A2085 Navy
  const secondaryColor = [28, 43, 58];    // #1C2B3A Dark Slate
  const accentColor = [15, 110, 86];      // #0F6E56 Teal
  const textColor = [55, 65, 81];         // #374151 Charcoal
  const lightBg = [245, 247, 250];        // Light gray background
  const borderColor = [229, 231, 235];    // Border gray

  function checkPageBreak(spaceNeeded = 40) {
    if (y + spaceNeeded > pageHeight - margin - 20) {
      doc.addPage();
      y = margin + 15;
      drawHeaderBanner();
    }
  }

  function drawHeaderBanner() {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, margin - 15, contentWidth, 3, 'F');
  }

  function addFooter(pageNum, totalPages) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text(
      'AAIA System Architecture & Engineering Report | Achtrex LLC',
      margin,
      pageHeight - 20
    );
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 20,
      { align: 'right' }
    );
  }

  // ── Cover / Header Box ──────────────────────────────────────────────────
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 90, 6, 6, 'F');
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.roundedRect(margin, y, contentWidth, 90, 6, 6, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AAIA — Cognitive Automotive Platform', margin + 18, y + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Comprehensive Technical Architecture, Methodology & Analysis Report', margin + 18, y + 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Published by: Achtrex LLC (achtrex.com)  |  Version: 1.0.0  |  Date: August 2026', margin + 18, y + 68);

  y += 110;

  function renderSectionHeader(title) {
    checkPageBreak(45);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 4, 16, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, margin + 10, y + 13);
    y += 24;
  }

  function renderSubHeader(title) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(title, margin, y);
    y += 15;
  }

  function renderParagraph(text) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkPageBreak(14);
      doc.text(line, margin, y);
      y += 13;
    }
    y += 5;
  }

  function renderBullet(title, desc) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const bulletPrefix = '• ';
    const indent = 12;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const titleWidth = doc.getTextWidth(title + ': ');
    
    checkPageBreak(16);
    doc.text(bulletPrefix + title + ': ', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    const remainingWidth = contentWidth - indent - titleWidth;
    const descLines = doc.splitTextToSize(desc, contentWidth - indent);
    
    // First line next to title, rest indented
    const firstLineWords = desc.split(' ');
    let currentFirstLine = '';
    let restText = '';
    
    // Simpler bullet rendering:
    const fullText = title + ': ' + desc;
    const fullLines = doc.splitTextToSize(fullText, contentWidth - indent);
    
    // Just draw standard bullet
    y -= 13; // reset from checkPageBreak
    doc.setFont('helvetica', 'bold');
    doc.text('•', margin, y);
    doc.text(title + ':', margin + 10, y);
    
    doc.setFont('helvetica', 'normal');
    const descFormatted = doc.splitTextToSize(desc, contentWidth - 14 - doc.getTextWidth(title + ': '));
    doc.text(descFormatted[0] || '', margin + 14 + doc.getTextWidth(title + ': '), y);
    y += 13;
    
    if (descFormatted.length > 1) {
      for (let i = 1; i < descFormatted.length; i++) {
        checkPageBreak(14);
        doc.text(descFormatted[i], margin + 10, y);
        y += 13;
      }
    }
    y += 3;
  }

  // ── Section 1: Executive Summary ─────────────────────────────────────────
  renderSectionHeader('1. Executive Summary & Platform Overview');
  renderParagraph(
    'AAIA (Automotive Artificial Intelligence Agent) is an enterprise-grade automotive reasoning platform engineered to bridge the divide between raw automotive telemetry and actionable decision intelligence. Built by Achtrex LLC, AAIA provides an AI-native operating system for vehicle owners, repair shops, dealerships, and commercial fleet managers.'
  );
  renderParagraph(
    'By synthesizing real-time vehicle sensor feeds, OEM databases, historical repair indices, and market depreciation curves through state-of-the-art Large Language Models (Anthropic Claude, Google Gemini, and xAI Grok), AAIA automates complex diagnostic workflows, maintenance forecasting, and financial total cost of ownership (TCO) modeling.'
  );

  // ── Section 2: Complete Technology Stack ─────────────────────────────────
  renderSectionHeader('2. Complete Technology Stack & Specifications');

  renderSubHeader('2.1 Frontend Presentation Tier');
  renderBullet('Core Framework', 'React 18 Single Page Application (SPA) with Concurrent Mode & Component Architecture.');
  renderBullet('Routing & Navigation', 'React Router v6 for secure, declarative route guarding and navigation state management.');
  renderBullet('Data Visualization', 'Recharts library delivering responsive telemetry graphs, token burn-down charts, and fleet indices.');
  renderBullet('Streaming UI & Parser', 'react-markdown and remark-gfm supporting real-time streaming tokens and markdown tables.');
  renderBullet('PDF Export Engine', 'Client-side isolated document rendering utilizing jsPDF and html2canvas.');
  renderBullet('Styling & Design System', 'Vanilla CSS custom tokens, HSL color palettes, dark-mode overlays, and responsive flex/grid layouts.');

  renderSubHeader('2.2 Backend & Server Architecture');
  renderBullet('Runtime & Server', 'Node.js (v20+ LTS) running Express.js v4 with modular RESTful routing and Service-Oriented separation.');
  renderBullet('Real-Time Comms', 'Socket.IO duplex WebSocket server for real-time telemetry streaming and event broadcasting.');
  renderBullet('Token Streaming', 'Server-Sent Events (SSE) via POST /api/chat/stream for zero-latency AI message generation.');
  renderBullet('Structured Logging', 'Winston logger with multi-transport logging (rotating files & standard out) paired with Morgan HTTP logging.');
  renderBullet('Security & Hardening', 'Helmet HTTP protection headers, CORS origin whitelisting, bcryptjs password hashing, and express-rate-limit.');

  renderSubHeader('2.3 AI & Cognitive Reasoning Layer');
  renderBullet('Anthropic Claude 3.5', '@anthropic-ai/sdk integration for deep automotive diagnostic reasoning and multi-step repair workflows.');
  renderBullet('Google Gemini 1.5/2.0', '@google/generative-ai integration for high-throughput multimodal telemetry and image inspection.');
  renderBullet('xAI Grok & OpenAI', 'OpenAI SDK compatibility layer connecting to xAI Grok-2 for conversational automotive analytics.');
  renderBullet('System Prompt Architecture', 'Over 700 lines of specialized domain guidance, safety boundaries, and repair taxonomies.');

  renderSubHeader('2.4 Database, Vector Search & Caching');
  renderBullet('Relational Storage', 'PostgreSQL 14+ with pg connection pool managing users, fleets, vehicles, diagnostics, invoices, and API keys.');
  renderBullet('Vector Storage (RAG)', 'pgvector extension for semantic vector embeddings across OEM repair manuals.');
  renderBullet('High-Speed Caching', 'Redis 7+ (ioredis) for high-speed VIN decoding cache, session token blacklists, and rate-limiting counters.');

  // ── Section 3: Engineering Methodologies ─────────────────────────────────
  renderSectionHeader('3. Engineering Methodologies & Key Innovations');
  
  renderBullet('Memory-Safe Client PDF Generation', 'Solved browser canvas memory bloat by isolating hidden export DOM trees with fixed off-screen coordinates (left: -2000px), eliminating layout shifts and mobile browser crashes.');
  renderBullet('Dynamic Database-Driven Pricing', 'Decoupled billing pricing matrices from client code into PostgreSQL JSONB schemas, allowing instantaneous plan and pricing modifications without application rebuilds.');
  renderBullet('Mobile-First Responsive Retrofitting', 'Implemented global CSS attribute overrides and container queries that dynamically normalize inline styling into flexible single-column mobile views.');
  renderBullet('Technical SEO & Semantic Structure', 'Engineered HTML5 semantic hierarchies, JSON-LD schemas, and Open Graph meta cards targeting high-converting automotive AI keywords.');

  // ── Section 4: Functional Modules & Analysis ──────────────────────────────
  renderSectionHeader('4. Core Modules & Analytical Workflows');

  renderSubHeader('4.1 Intelligent Diagnostics (SEV-0 to SEV-5)');
  renderParagraph(
    'The diagnostic engine combines user-reported symptoms, OBD-II Diagnostic Trouble Codes (DTCs), and VIN-specific OEM specifications to generate probability-ranked component failure analyses, DIY vs. professional recommendations, and labor-hour cost estimates.'
  );

  renderSubHeader('4.2 5-Year Total Cost of Ownership (TCO) Analysis');
  renderParagraph(
    'Computes full lifecycle financial impact by calculating Purchase Price, Fuel/Energy Consumption, Scheduled Maintenance, Expected Unscheduled Repairs, and Estimated Residual Depreciation over customizable multi-year horizons.'
  );

  renderSubHeader('4.3 Fleet Management & Health Indexing');
  renderParagraph(
    'Provides multi-vehicle tracking, automated mileage decay forecasting, centralized recall monitoring, and scheduled maintenance dispatching to minimize fleet downtime.'
  );

  // ── Section 5: Technical Summary Table ───────────────────────────────────
  renderSectionHeader('5. Technical Architecture Summary');
  checkPageBreak(120);

  const tableData = [
    ['Layer', 'Technologies / Specifications'],
    ['Presentation Tier', 'React 18, React Router v6, Recharts, jsPDF, html2canvas, Tabler Icons'],
    ['Server Gateway', 'Node.js 20+, Express.js, Socket.IO, Helmet, Morgan, Winston'],
    ['AI Reasoning Layer', 'Anthropic Claude 3.5, Google Gemini 1.5/2.0, xAI Grok / OpenAI'],
    ['Database & Vector', 'PostgreSQL 14+ with pgvector, Connection Pooling'],
    ['Cache & Session', 'Redis 7+ (ioredis), node-cache memory fallback'],
    ['Security & Auth', 'JWT (JSON Web Tokens), bcryptjs, RBAC, Rate-Limiting'],
    ['Data Integrations', 'AutomotiveDataset.com, NHTSA Safety & Recalls API']
  ];

  const colWidths = [120, contentWidth - 120];
  const rowHeight = 20;

  for (let r = 0; r < tableData.length; r++) {
    const isHeader = r === 0;
    checkPageBreak(rowHeight + 4);

    if (isHeader) {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setFillColor(r % 2 === 0 ? lightBg[0] : 255, r % 2 === 0 ? lightBg[1] : 255, r % 2 === 0 ? lightBg[2] : 255);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(margin, y, contentWidth, rowHeight, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    }

    doc.text(tableData[r][0], margin + 8, y + 13);
    doc.text(tableData[r][1], margin + colWidths[0] + 8, y + 13);
    y += rowHeight;
  }

  y += 20;

  // ── Add page numbers and footers to all pages ────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeaderBanner();
    addFooter(i, totalPages);
  }

  // Save the PDF
  const outputPath = path.join(__dirname, 'AAIA_Technical_Architecture_and_Methodology_Report.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`Report successfully created at: ${outputPath}`);
  return outputPath;
}

createReportPDF();
