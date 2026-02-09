-- Clear existing resources
TRUNCATE TABLE resources RESTART IDENTITY;

-- Seed 10 CSR Project Management Resources
INSERT INTO resources (title, description, link, created_at)
VALUES
    (
        'Annual CSR Strategic Roadmap',
        'Template for planning year-long Corporate Social Responsibility initiatives aligned with business OKRs.',
        'https://docs.google.com/presentation/example-csr-roadmap',
        NOW()
    ),
    (
        'Stakeholder Engagement Matrix',
        'Tool for identifying and prioritizing key community, government, and NGO stakeholders.',
        'https://docs.google.com/spreadsheets/example-stakeholder-matrix',
        NOW()
    ),
    (
        'Sustainability Report (GRI Standard)',
        'Draft template for the annual sustainability report following Global Reporting Initiative standards.',
        'https://docs.google.com/document/example-sustainability-report',
        NOW()
    ),
    (
        'Social Impact Assessment (SROI) Calculator',
        'Excel model to calculate the Social Return on Investment for community development projects.',
        'https://docs.google.com/spreadsheets/example-sroi-calculator',
        NOW()
    ),
    (
        'Employee Volunteering Handbook',
        'Guidelines and SOPs for managing employee participation in community service programs.',
        'https://docs.google.com/document/example-volunteering-handbook',
        NOW()
    ),
    (
        'Grant Proposal & Budget Template',
        'Standardized format for NGO partners to submit funding proposals for CSR grants.',
        'https://docs.google.com/document/example-grant-proposal',
        NOW()
    ),
    (
        'Environmental Compliance Checklist',
        'Operational checklist to ensure all projects meet local environmental regulations and ISO 14001.',
        'https://docs.google.com/spreadsheets/example-env-checklist',
        NOW()
    ),
    (
        'Community Needs Assessment Survey',
        'Questionnaire and data collection tool for identifying high-priority local community needs.',
        'https://forms.google.com/example-needs-assessment',
        NOW()
    ),
    (
        'CSR Communication & PR Kit',
        'Assets and guidelines for communicating impact stories to internal and external audiences.',
        'https://drive.google.com/drive/folders/example-pr-kit',
        NOW()
    ),
    (
        'Partnership Memorandum of Understanding (MoU)',
        'Legal template for formalizing partnerships with non-profits and implementation agencies.',
        'https://docs.google.com/document/example-mou-template',
        NOW()
    );
