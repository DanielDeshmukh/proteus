"""
Diverse resume fixtures covering different industries, seniority levels, and quality levels.
"""

# --- HEALTHCARE DATA SCIENTIST RESUME (GOOD MATCH) ---

HEALTHCARE_DS_RESUME = """
DR. PRIYA SHARMA
priya.sharma@email.com | (617) 555-0192 | Boston, MA
linkedin.com/in/priyasharma

SUMMARY
Data scientist with 4 years of experience in healthcare analytics. Published researcher with expertise in clinical prediction models and real-world evidence analysis.

SKILLS
Languages: Python, R, SAS, SQL
ML/Stats: scikit-learn, TensorFlow, PyTorch, survival analysis, Bayesian methods
Data: pandas, NumPy, Spark, PostgreSQL, Redshift
Visualization: Tableau, Matplotlib, Plotly, Seaborn
Healthcare: EHR data (Epic, Cerner), claims data, ICD-10, HL7/FHIR

EXPERIENCE

Data Scientist | Boston Medical Center | Jan 2022 - Present
- Built readmission prediction model achieving 0.87 AUC, deployed to clinical dashboard
- Analyzed 500K+ patient records to identify high-risk populations for care management
- Developed NLP pipeline to extract social determinants of health from clinical notes
- Presented findings to hospital leadership, influencing $2M care management investment

Research Analyst | Harvard T.H. Chan School of Public Health | Jun 2019 - Dec 2021
- Conducted survival analysis on 100K+ cancer patients using SEER database
- Published 3 papers in peer-reviewed journals (JAMA, Lancet Digital Health)
- Built interactive data dashboards for principal investigators
- Mentored 2 graduate students in statistical methods

EDUCATION
MPH Biostatistics | Harvard School of Public Health | 2019
B.S. Statistics | University of Michigan | 2017

CERTIFICATIONS
Google Cloud Professional Data Engineer | 2023
"""

# --- GAME DEVELOPER RESUME (PARTIAL MATCH) ---

GAME_DEV_RESUME = """
MARCUS JOHNSON
marcus.j@email.com | (206) 555-0187 | Seattle, WA
github.com/marcusj | marcusjohnson.dev

SUMMARY
Game programmer with 4 years of experience in Unity and 2 years learning Unreal Engine. Passionate about gameplay systems and procedural generation.

SKILLS
Languages: C#, C++, Python, Lua
Engines: Unity (expert), Unreal Engine (intermediate), Godot
Platforms: PC, WebGL, Android
Tools: Git, Perforce, Blender (basic), Wwise

EXPERIENCE

Game Programmer | Indie Studio | Mar 2022 - Present
- Developed core combat system for Unity action RPG (released on Steam, 85% positive)
- Implemented procedural dungeon generation using wave function collapse
- Optimized rendering pipeline achieving 2x FPS improvement on mid-range hardware
- Built in-game analytics tool tracking player behavior for level design iteration

Junior Game Developer | MobileGames Co | Jul 2020 - Feb 2022
- Built 3 mobile games in Unity shipped to iOS and Android
- Implemented ad mediation and IAP systems increasing revenue by 35%
- Created reusable UI framework used across 5 projects
- Optimized memory usage reducing crash rate by 60%

PROJECTS

Procedural Terrain Generator
- Open-source tool for generating realistic terrain using noise algorithms
- Technologies: C++, OpenGL, ImGui
- 500+ GitHub stars

Personal Portfolio Game
- Small puzzle game showcasing programming skills
- Technologies: Godot, GDScript

EDUCATION
B.S. Computer Science | University of Washington | 2020
"""

# --- DEVOPS/SRE RESUME (STRONG MATCH) ---

SRE_RESUME = """
SARAH CHEN
sarah.chen@email.com | (415) 555-0134 | San Francisco, CA
linkedin.com/in/sarahchen | github.com/schen-sre

SUMMARY
SRE with 6 years of experience ensuring high availability for consumer and enterprise platforms. Deep expertise in Kubernetes, observability, and incident response.

SKILLS
Cloud: AWS (EKS, EC2, Lambda, RDS, S3), GCP (GKE, Cloud Run)
Containers: Kubernetes, Docker, Helm, ArgoCD
IaC: Terraform, CloudFormation, Pulumi
Languages: Python, Go, Bash
Observability: Prometheus, Grafana, Datadog, ELK, Jaeger
CI/CD: GitHub Actions, Jenkins, ArgoCD

EXPERIENCE

Senior SRE | Stripe | Apr 2022 - Present
- Managed Kubernetes clusters serving 100M+ daily API requests at 99.99% uptime
- Built automated incident response system reducing MTTR from 45min to 8min
- Designed chaos engineering program using Litmus Chaos, improving resilience
- Led migration from self-managed K8s to EKS, reducing operational overhead by 40%
- On-call lead for 20-person rotation, authored 15+ runbooks

SRE | Datadog | Jun 2019 - Mar 2022
- Built monitoring infrastructure tracking 500K+ hosts and 10B+ metrics/day
- Implemented auto-scaling policies saving $200K/month in cloud costs
- Developed Terraform modules used by 8 engineering teams
- Created SLO framework adopted across the organization
- Participated in on-call rotation, resolved 200+ incidents

DevOps Engineer | StartupXYZ | Aug 2017 - May 2019
- Set up CI/CD pipeline reducing deployment time from 2 hours to 15 minutes
- Containerized legacy monolith into 12 microservices
- Implemented centralized logging with ELK stack
- Automated infrastructure provisioning with Terraform

EDUCATION
B.S. Computer Science | UC Berkeley | 2017

CERTIFICATIONS
Certified Kubernetes Administrator (CKA) | 2022
AWS Solutions Architect Professional | 2021
"""

# --- AI/ML RESUME (UNDERQUALIFIED) ---

AI_ML_JUNIOR_RESUME = """
ALEX PARK
alex.park@email.com | (408) 555-0156 | San Jose, CA
github.com/alexparks

SUMMARY
Recent Master's graduate with strong fundamentals in machine learning and NLP. Looking to apply academic research experience in a production ML role.

SKILLS
Languages: Python, R, Java
ML/DL: PyTorch, scikit-learn, Hugging Face Transformers, spaCy
Data: pandas, NumPy, SQL, MongoDB
Tools: Git, Docker, Jupyter, MLflow
NLP: Text classification, NER, sentiment analysis, embeddings

EXPERIENCE

ML Research Intern | AI Research Lab | Jun 2023 - Sep 2023
- Fine-tuned BERT for medical NER achieving 91% F1 score on custom dataset
- Built evaluation framework for comparing 5+ NLP models
- Prepared research paper submitted to EMNLP 2024 (under review)

Teaching Assistant | Stanford NLP Group | Jan 2023 - Jun 2023
- Led discussion sections for 80+ students in NLP course
- Graded assignments on transformers, attention mechanisms, and language modeling
- Created tutorial materials on fine-tuning pretrained models

PROJECTS

Multi-Lingual Sentiment Analyzer
- Built multilingual sentiment classifier using XLM-RoBERTa
- Achieved 89% accuracy across 12 languages
- Technologies: Python, PyTorch, Hugging Face

Research Paper Search Engine
- Semantic search over 100K+ arXiv papers using sentence embeddings
- Technologies: Python, FAISS, Sentence-BERT, FastAPI

EDUCATION
M.S. Computer Science (NLP Specialization) | Stanford University | 2023
B.S. Computer Science | UC San Diego | 2021
"""

# --- PRODUCT MANAGER RESUME (CAREER CHANGER) ---

PM_CAREER_CHANGER_RESUME = """
JESSICA MARTINEZ
jessica.martinez@email.com | (917) 555-0178 | New York, NY
linkedin.com/in/jessicamartinez

SUMMARY
Former software engineer transitioning to product management. 4 years of technical experience combined with MBA and product strategy internships. Passionate about building products that solve real customer problems.

SKILLS
Technical: SQL, Python (basic), API design, system architecture
Product: User research, roadmapping, A/B testing, metrics definition
Tools: Jira, Figma, Amplitude, Mixpanel, Miro
Business: Financial modeling, market sizing, competitive analysis

EXPERIENCE

Product Manager Intern | Shopify | Jun 2024 - Aug 2024
- Owned feature prioritization for merchant onboarding flow (affects 100K+ merchants)
- Conducted 15+ merchant interviews to identify pain points
- Defined success metrics and designed A/B test for new checkout flow
- Result: 12% improvement in merchant conversion rate

Software Engineer | MongoDB | Jul 2020 - Aug 2023
- Built APIs and internal tools for MongoDB Atlas (used by 30K+ customers)
- Led feature development for query optimizer, reducing query time by 25%
- Participated in product discussions, provided technical feasibility input
- Mentored 3 junior engineers

Software Engineering Intern | Google | Jun 2019 - Aug 2019
- Built internal dashboard for monitoring Cloud SQL performance
- Technologies: Python, Go, BigQuery

EDUCATION
MBA | Columbia Business School | 2024
B.S. Computer Science | Cornell University | 2020

CERTIFICATIONS
Pragmatic Institute Product Management Certification | 2024
"""

# --- MOBILE DEVELOPER RESUME (GOOD MATCH) ---

MOBILE_DEV_RESUME = """
ALEX RIVERA
alex.rivera@email.com | (310) 555-0145 | Los Angeles, CA
github.com/alexrivera | alexrivera.dev

SUMMARY
iOS developer with 4 years of experience building consumer apps with 5M+ combined downloads. Expert in Swift, SwiftUI, and health/fitness integrations.

SKILLS
Languages: Swift, Objective-C, Python
Frameworks: SwiftUI, UIKit, HealthKit, Core Motion, WatchKit, Combine
Architecture: MVVM, VIPER, Clean Architecture
Tools: Xcode, Instruments, Fastlane, TestFlight, Firebase
Testing: XCTest, XCUITest, snapshot testing

EXPERIENCE

Senior iOS Developer | FitTrack | Jan 2022 - Present
- Led development of Apple Watch companion app using WatchKit and HealthKit
- Implemented custom workout detection using Core Motion accelerometer data
- Built complex animations for activity rings achieving 60fps on all devices
- Reduced app startup time by 40% through lazy loading and profiling
- App rated 4.9 stars, featured in App Store "Apps We Love"

iOS Developer | HealthApp Inc | Aug 2019 - Dec 2021
- Built core tracking features processing 10K+ daily health data points
- Implemented on-device ML model for activity classification using Core ML
- Created custom UI components library used across 3 iOS apps
- Set up CI/CD pipeline with Fastlane reducing release time from 2 days to 2 hours
- Mentored 2 junior developers

PROJECTS

Workout Timer App
- Personal project: interval timer with haptic feedback and Apple Watch support
- Technologies: Swift, SwiftUI, HealthKit, WatchKit
- 50K downloads on App Store

EDUCATION
B.S. Computer Science | UCLA | 2019
"""

# --- SECURITY ENGINEER RESUME (PARTIAL MATCH) ---

SECURITY_RESUME = """
KIM NGUYEN
kim.nguyen@email.com | (202) 555-0199 | Washington, DC
linkedin.com/in/kimnguyen | github.com/kimnguyen-sec

SUMMARY
Application security engineer with 4 years of experience in financial services. Skilled in code review, penetration testing, and building DevSecOps pipelines.

SKILLS
Security: OWASP Top 10, SAST/DAST, threat modeling, penetration testing
Languages: Python, Go, JavaScript
Cloud: AWS (IAM, GuardDuty, Security Hub), GCP Security
Tools: Snyk, SonarQube, Burp Suite, OWASP ZAP, Semgrep
Compliance: PCI-DSS, SOC 2, GDPR

EXPERIENCE

Application Security Engineer | JPMorgan Chase | Mar 2022 - Present
- Conduct security code reviews for 50+ microservices
- Built automated SAST pipeline using Semgrep, catching 200+ vulnerabilities pre-deploy
- Performed penetration testing on mobile banking app, identified 15 critical findings
- Led PCI-DSS compliance effort for payment processing system
- Created security training program for 100+ developers

Security Analyst | Deloitte Cyber | Jul 2019 - Feb 2022
- Performed application security assessments for Fortune 500 clients
- Developed custom security scanning tools in Python
- Conducted red team exercises and social engineering assessments
- Wrote security architecture recommendations and remediation guides
- Participated in incident response for 3 major breach investigations

EDUCATION
B.S. Cybersecurity | George Washington University | 2019

CERTIFICATIONS
Certified Ethical Hacker (CEH) | 2022
CompTIA Security+ | 2020
"""

# --- UX DESIGNER RESUME (STRONG MATCH) ---

UX_DESIGNER_RESUME = """
EMILY ZHANG
emily.zhang@email.com | (512) 555-0167 | Austin, TX
emilyzhang.design | portfolio.emilyzhang.com

SUMMARY
Senior UX designer with 6 years of experience creating digital products for enterprise and consumer clients. Expert in design systems, user research, and cross-functional collaboration.

SKILLS
Design: Figma (expert), Sketch, Adobe XD, Principle, Framer
Research: Usability testing, card sorting, tree testing, surveys, A/B analysis
Prototyping: High-fidelity interactive prototypes, micro-interactions
Systems: Design tokens, component libraries, documentation
Development: Basic HTML/CSS, understanding of frontend constraints

EXPERIENCE

Senior UX Designer | DesignCraft (Consultancy) | Apr 2022 - Present
- Led redesign of Fortune 500 healthcare platform serving 50K+ clinicians
- Conducted 40+ user interviews and 12 usability test sessions
- Created comprehensive design system with 200+ components in Figma
- Reduced user onboarding time by 35% through information architecture redesign
- Presented to C-suite stakeholders, won 2 additional client engagements

UX Designer | Indeed | Jun 2019 - Mar 2022
- Designed job search features used by 50M+ monthly active users
- Led accessibility redesign achieving WCAG 2.1 AA compliance
- Created motion design system for micro-interactions across mobile apps
- Facilitated design thinking workshops with engineering and product teams
- Mentored 2 junior designers

UI/UX Intern | IBM Design | Jun 2018 - Aug 2018
- Designed enterprise dashboard components for IBM Cloud
- Participated in design sprints and user research sessions

EDUCATION
B.F.A. Graphic Design | Rhode Island School of Design | 2018
"""

# --- DATA ENGINEER RESUME (UNDERQUALIFIED) ---

DATA_ENG_JUNIOR_RESUME = """
TYLER BROOKS
tyler.brooks@email.com | (312) 555-0123 | Chicago, IL
github.com/tylerbrooksd

SUMMARY
Data analyst transitioning to data engineering. 2 years of experience with SQL, Python, and data visualization. Building skills in Spark and pipeline orchestration.

SKILLS
Languages: Python, SQL, basic Scala
Data: pandas, NumPy, PostgreSQL, MySQL
Visualization: Tableau, Power BI, Matplotlib
Learning: Apache Spark, Airflow, dbt
Cloud: Basic AWS (S3, RDS)

EXPERIENCE

Data Analyst | RetailCo | Jul 2022 - Present
- Built SQL queries and Python scripts for daily sales reporting
- Created Tableau dashboards used by 30+ business stakeholders
- Automated data collection pipeline reducing manual work by 10 hours/week
- Maintained PostgreSQL database with 50M+ rows

Data Intern | Analytics Firm | Jan 2022 - Jun 2022
- Assisted with ETL processes using Python and pandas
- Cleaned and transformed datasets for machine learning projects
- Created documentation for data pipeline processes

PROJECTS

NYC Transit Data Pipeline
- Built end-to-end ETL pipeline processing NYC subway data
- Technologies: Python, Apache Airflow, PostgreSQL, dbt
- GitHub: github.com/tylerbrooksd/nyc-transit

EDUCATION
B.S. Statistics | University of Illinois | 2022
"""

# --- VP ENGINEERING RESUME (EXECUTIVE LEVEL) ---

VP_ENG_RESUME = """
DAVID KIM
david.kim@email.com | (415) 555-0111 | San Francisco, CA
linkedin.com/in/davidkim-eng

SUMMARY
Engineering leader with 14 years of experience building and scaling high-performing teams. Former CTO at two startups, VP Engineering at public SaaS company. Track record of scaling orgs from 10 to 100+ engineers.

LEADERSHIP EXPERIENCE

VP of Engineering | CloudPlatform Inc (Public, $500M ARR) | Jan 2021 - Present
- Lead 90 engineers across 10 teams (platform, product, infrastructure, security)
- Grew team from 40 to 90 engineers while maintaining 85% retention
- Drove architectural migration from monolith to microservices, improving deploy frequency 10x
- Established engineering levels framework and career ladder
- Reduced incident rate by 60% through SRE practices and blameless post-mortems
- Partner with Product, Design, and Sales to deliver $50M+ in new features annually

Director of Engineering | DataStartup (Series C, 200 employees) | Mar 2018 - Dec 2020
- Led 35-engineer organization through Series B to C funding
- Launched 4 major product lines generating $20M ARR in first year
- Built ML platform team from 0 to 8 engineers
- Implemented engineering OKRs and quarterly planning process
- Managed $8M annual engineering budget

Engineering Manager | Stripe | Jun 2015 - Feb 2018
- Managed 15 engineers on payments infrastructure team
- Led PCI-DSS compliance project for payment processing
- Designed real-time fraud detection system processing $1B+ daily

Software Engineer | Google | Jul 2011 - May 2015
- Built distributed systems for Google Cloud Platform
- Contributed to Borg (predecessor to Kubernetes)

EDUCATION
M.S. Computer Science | Stanford University | 2011
B.S. Computer Science | UC Berkeley | 2009
"""

# --- JUNIOR FRONTEND RESUME (ENTRY LEVEL) ---

JUNIOR_FRONTEND_RESUME = """
MIA WILSON
mia.wilson@email.com | (503) 555-0188 | Portland, OR
github.com/miawilson | miawilson.dev

SUMMARY
Frontend developer with 1 year of professional experience and a strong portfolio of personal projects. Passionate about creating accessible, performant web experiences.

SKILLS
Languages: HTML5, CSS3, JavaScript (ES6+), basic TypeScript
Frameworks: React (primary), Vue.js (basic)
Styling: Tailwind CSS, CSS Modules, Styled Components
Tools: Git, VS Code, Chrome DevTools, Figma (basic)
Testing: Jest (basic), React Testing Library

EXPERIENCE

Junior Frontend Developer | WebCraft Agency | Jan 2024 - Present
- Build responsive landing pages and marketing sites for 8+ clients
- Implement designs in React with Tailwind CSS
- Collaborate with designers to ensure pixel-perfect implementation
- Participate in code reviews and incorporate feedback
- Optimized Core Web Vitals scores improving Lighthouse from 65 to 92

Freelance Web Developer | Self-Employed | Jun 2023 - Dec 2023
- Built 5 websites for local small businesses
- Technologies: React, Tailwind CSS, Netlify
- Managed client relationships and project timelines

PROJECTS

Recipe Finder App
- Full-stack recipe search app with dietary filter and meal planning
- Technologies: React, Node.js, MongoDB, Tailwind CSS
- Features: User accounts, saved recipes, shopping list generator

Weather Dashboard
- Interactive weather dashboard with 7-day forecasts and maps
- Technologies: React, OpenWeatherMap API, Chart.js
- Achieved 95 Lighthouse performance score

EDUCATION
B.A. Digital Media | Portland State University | 2023
"""

# --- QUANT ANALYST RESUME (UNDERQUALIFIED) ---

QUANT_JUNIOR_RESUME = """
NOAH FISCHER
noah.fischer@email.com | (212) 555-0155 | New York, NY
github.com/noahfischer

SUMMARY
Recent Master's graduate in Financial Engineering with strong quantitative skills. Proficient in Python and statistical modeling. Seeking to apply academic knowledge in a quantitative finance role.

SKILLS
Languages: Python, R, SQL, basic C++
Quantitative: Time series analysis, stochastic calculus, Monte Carlo simulation, regression
Finance: Options pricing (Black-Scholes), portfolio optimization, risk metrics (VaR, CVaR)
Tools: pandas, NumPy, SciPy, scikit-learn, Jupyter, Bloomberg Terminal (basic)
ML: Linear regression, random forests, gradient boosting (basic neural networks)

EXPERIENCE

Quantitative Research Intern | hedge Fund | Jun 2024 - Aug 2024
- Developed momentum factor strategy backtested on 10 years of equity data
- Built Monte Carlo simulation engine for options pricing
- Analyzed market microstructure data to identify liquidity signals
- Technologies: Python, pandas, NumPy

Teaching Assistant | Columbia Financial Engineering | Jan 2024 - May 2024
- Led recitation sections for 60+ students in derivatives pricing course
- Graded assignments on Black-Scholes, binomial trees, and Greeks

Graduate Research Assistant | Columbia University | Sep 2022 - May 2024
- Researched regime-switching models for volatility forecasting
- Published working paper on LSTM models for interest rate prediction
- Built backtesting framework for systematic trading strategies

EDUCATION
M.S. Financial Engineering | Columbia University | 2024
B.S. Mathematics & Economics | NYU | 2022
"""
