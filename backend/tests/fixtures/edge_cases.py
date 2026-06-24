"""
Edge case JD and resume fixtures for boundary testing.
"""

# --- MINIMAL JD (bare minimum info) ---

MINIMAL_JD = """
Engineer needed. Python required. Remote.
"""

# --- VERY LONG JD (bloated with boilerplate) ---

LONG_JD = """
Senior Software Engineer - Full Stack

Company: MegaCorp International
Location: Multiple (San Francisco, New York, London, Singapore, Sydney)
Department: Engineering > Platform > Core Infrastructure
Reports to: Director of Engineering
Employment Type: Full-time
Level: IC4 (Senior)

About MegaCorp:
MegaCorp International is a Fortune 500 technology company serving 200M+ users across 150 countries. We've been in business for 25 years, are publicly traded (NYSE: MECA), and have been recognized as one of Fortune's "Most Innovative Companies" for 8 consecutive years.

Our engineering organization consists of 2,000+ engineers across 50+ teams. We practice agile methodology, hold weekly sprint planning, bi-weekly retrospectives, and monthly architecture reviews. Our tech stack includes Python, Go, Java, React, PostgreSQL, Redis, Kafka, Kubernetes, and AWS.

About the Role:
We're looking for a Senior Software Engineer to join our Core Platform team. You'll work on the foundational services that power all of MegaCorp's products, serving 50M+ daily active users.

Responsibilities:
- Design and implement scalable backend services using Python and Go
- Build and maintain RESTful and gRPC APIs
- Optimize database queries and data models for performance at scale
- Participate in on-call rotation (1 week every 8 weeks)
- Contribute to technical design documents and architecture decisions
- Mentor junior and mid-level engineers through code reviews and pair programming
- Collaborate with product managers and designers on feature planning
- Write comprehensive unit, integration, and end-to-end tests
- Participate in incident response and post-mortem processes
- Contribute to open-source projects maintained by our team

Requirements:
- 5+ years of professional software engineering experience
- Strong proficiency in Python and/or Go
- Experience with relational databases (PostgreSQL preferred)
- Experience with caching systems (Redis, Memcached)
- Familiarity with message queues (Kafka, RabbitMQ, SQS)
- Understanding of microservices architecture and distributed systems
- Experience with containerization (Docker) and orchestration (Kubernetes)
- Cloud platform experience (AWS, GCP, or Azure)
- Strong problem-solving skills and attention to detail
- Excellent written and verbal communication skills
- Experience with CI/CD pipelines (GitHub Actions, Jenkins, CircleCI)
- Understanding of monitoring and observability (Prometheus, Grafana, Datadog)

Nice to Have:
- Experience with financial systems or payment processing
- Knowledge of event-driven architecture patterns
- Experience with GraphQL APIs
- Contributions to open-source projects
- Experience with performance optimization at scale
- Knowledge of security best practices (OWASP, encryption at rest/in transit)
- Experience with A/B testing and feature flagging systems
- Familiarity with machine learning infrastructure

Benefits:
- Competitive salary: $180,000 - $250,000 (commensurate with experience)
- Annual performance bonus: up to 25% of base salary
- Equity: RSUs vesting over 4 years
- Health, dental, and vision insurance (100% premium covered for employee)
- 401(k) with 6% company match
- Unlimited PTO (with 15-day minimum encouraged)
- $5,000 annual learning and development budget
- Home office stipend of $2,000
- Gym membership reimbursement
- 16 weeks paid parental leave
- Commuter benefits

Equal Opportunity Employer:
MegaCorp is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees. We do not discriminate based on race, color, religion, sex, sexual orientation, gender identity, national origin, disability, veteran status, or any other legally protected characteristic.

Application Process:
1. Apply online with resume and cover letter
2. Recruiter phone screen (30 minutes)
3. Technical phone screen (60 minutes)
4. Virtual onsite: 4 rounds (coding, system design, behavioral, team fit)
5. Offer stage

We respond to all applications within 5 business days.
"""

# --- MINIMAL RESUME (bare minimum) ---

MINIMAL_RESUME = """
John Smith
john@email.com

Skills: Python, JavaScript
Experience: Software Developer at TechCo (2020-2024)
Education: B.S. Computer Science, State University, 2020
"""

# --- OVERQUALIFIED RESUME (VP applying to junior role) ---

OVERQUALIFIED_RESUME = """
DR. ROBERT CHANG, PHD
robert.chang@email.com | (650) 555-0200 | Palo Alto, CA
linkedin.com/in/robertchang | github.com/rchang

SUMMARY
Former VP of Engineering with 20+ years of experience. PhD in Computer Science from MIT. Led organizations of 200+ engineers. Looking to return to hands-on coding as an individual contributor.

SKILLS
Languages: Python, Go, Java, C++, Rust, TypeScript, Ruby
Cloud: AWS, GCP, Azure (all services)
Infrastructure: Kubernetes, Terraform, Istio, Envoy
Databases: PostgreSQL, MongoDB, Cassandra, DynamoDB, Neo4j
ML: TensorFlow, PyTorch, JAX
Leadership: OKRs, agile, sprint planning, hiring, performance management

EXPERIENCE

VP of Engineering | TechGiant Corp | 2018 - 2023
- Led 200 engineers across 20 teams
- Oversaw $50M engineering budget
- Launched 15 major products generating $200M ARR
- Scaled engineering from 80 to 200 people

CTO | StartupAlpha (Acquired) | 2014 - 2018
- Built technical team from 5 to 50 engineers
- Led company to $100M acquisition by TechGiant
- Designed core platform architecture serving 10M users

Director of Engineering | MegaSaaS Inc | 2010 - 2014
- Led platform engineering team of 25
- Migrated infrastructure to AWS, saving $1M annually
- Implemented CI/CD reducing deployment time from days to hours

Senior Software Engineer | Google | 2005 - 2010
- Built core infrastructure for Google Search
- Contributed to early Google Cloud Platform
- Published 10+ papers on distributed systems

Software Engineer | Microsoft | 2002 - 2005
- Worked on Windows Server kernel
- Built networking stack components

EDUCATION
PhD Computer Science | MIT | 2002
B.S. Computer Science | Caltech | 1999

PATENTS
- US Patent 10,123,456: Distributed Consensus Algorithm
- US Patent 10,234,567: Scalable Message Queue Architecture

PUBLICATIONS
- 15 peer-reviewed papers in top-tier conferences (OSDI, SOSP, NSDI)
"""

# --- CAREER CHANGER RESUME (completely different field) ---

CAREER_CHANGER_RESUME = """
SARAH JOHNSON
sarah.j@email.com | (555) 234-5678 | Denver, CO
linkedin.com/in/sarahjohnson-career

SUMMARY
Former healthcare nurse transitioning to healthcare technology. 8 years of clinical experience combined with recent coding bootcamp completion. Bridging the gap between clinical workflows and software solutions.

SKILLS
Clinical: RN license, ICU experience, EHR systems (Epic, Cerner), clinical workflows
Technical: HTML, CSS, JavaScript, React (basic), Python (basic), SQL (basic)
Tools: Git, VS Code, Figma (basic), Jira
Domain: Healthcare interoperability (HL7, FHIR), clinical decision support

EXPERIENCE

Software Engineering Bootcamp Student | Code Academy | Sep 2024 - Dec 2024
- Completed 16-week intensive bootcamp (600+ hours)
- Built 3 full-stack projects including healthcare appointment scheduling app
- Technologies: React, Node.js, PostgreSQL, Express
- Capstone project: patient handoff communication tool

Registered Nurse | Denver General Hospital | Mar 2016 - Aug 2024
- Provided critical care nursing for 8 years in 30-bed ICU
- Served as charge nurse managing 12 nurses per shift
- Led EHR implementation committee, trained 50+ staff on Epic workflows
- Identified gaps in patient communication tools, documented improvement proposals
- Preceptor for 20+ new graduate nurses

EDUCATION
B.S. Nursing | University of Colorado | 2015
Full Stack Web Development Certificate | Code Academy | 2024

VOLUNTEER
- Built simple website for local free clinic
- Mentored nursing students interested in health tech
"""

# --- NON-ENGLISH CONTENT (international JD) ---

INTERNATIONAL_JD = """
Entwickler (m/w/d) - Backend

Unternehmen: TechVision GmbH
Standort: Berlin, Deutschland (Hybrid)

Uber die Rolle:
Wir suchen einen erfahrenen Backend-Entwickler fur unser wachsendes SaaS-Team. Sie werden an unserer Kernplattform arbeiten, die taglich von 100.000+ Nutzern genutzt wird.

Anforderungen:
- 4+ Jahre Erfahrung in der Backend-Entwicklung
- Starke Python- oder Java-Kenntnisse
- Erfahrung mit PostgreSQL und Redis
- Kenntnisse in Docker und Kubernetes
- Erfahrung mit REST- oder GraphQL-APIs
- Deutsch- und Englischkenntnisse (flieBend)

Benefits:
- Wettbewerbsfahiges Gehalt (EUR 70.000 - 95.000)
- 30 Urlaubstage
- Flexible Arbeitszeiten
- Homeoffice-Pauschale
- Fortbildungsbudget
"""

# --- JD WITH UNUSUAL FORMAT (no sections, paragraph style) ---

PARAGRAPH_JD = """
We are a fast-growing fintech startup looking for a full-stack engineer to join our small but mighty team of 8 developers. You should be comfortable working across the entire stack - from building React frontends to designing PostgreSQL schemas and deploying to AWS. We use TypeScript throughout, with Node.js on the backend and React on the frontend. Experience with payment processing (Stripe, Plaid) is a huge plus. We move fast, ship weekly, and value engineers who can own features end-to-end. You'll be employee #15 and will have significant influence over our technical direction. We offer competitive salary ($120K-$160K), meaningful equity, and the chance to build something from the ground up.
"""

# --- RESUME WITH GAPS (employment gaps) ---

RESUME_WITH_GAPS = """
MICHAEL BROWN
michael.b@email.com | (555) 345-6789 | Seattle, WA

SUMMARY
Backend developer with intermittent experience due to career breaks. Strong Python and database skills.

SKILLS
Python, Django, PostgreSQL, Redis, Docker, Git, AWS

EXPERIENCE

Backend Developer | CloudTech | Jan 2023 - Jun 2023
- Built REST APIs for customer management system
- Optimized database queries reducing response time by 30%
- Technologies: Python, Django, PostgreSQL, Redis

Career Break | Jul 2023 - Dec 2023
- Family caregiving responsibilities

Freelance Developer | Self-Employed | Jan 2024 - May 2024
- Built e-commerce platform for local business
- Technologies: Python, Django, Stripe, PostgreSQL

Career Break | Jun 2020 - Dec 2021
- Personal health issues

Software Developer | StartupXYZ | Mar 2018 - May 2020
- Developed backend services for IoT platform
- Implemented data pipeline processing 10K+ events/minute
- Technologies: Python, Flask, AWS IoT, DynamoDB

EDUCATION
B.S. Computer Science | University of Washington | 2017
"""
