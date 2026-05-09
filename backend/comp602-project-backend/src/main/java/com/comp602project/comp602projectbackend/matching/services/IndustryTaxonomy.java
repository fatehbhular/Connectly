package com.comp602project.comp602projectbackend.matching.services;

import java.util.*;

/**
 * IndustryTaxonomy defines the category mappings and adjacency graph used by FieldScorer.
 *
 * Categories:
 *   tech, design, business, engineering, science, healthcare,
 *   creative, education, law, finance, social, trades, hospitality, sports, media
 */
public class IndustryTaxonomy {

    public static final Map<String, String> INDUSTRY_CATEGORY = new HashMap<>();

    static {

        String[] tech = {
            "software engineering", "software engineer", "software development",
            "software developer", "computer science", "computer engineering",
            "data science", "data scientist", "data engineering", "data engineer",
            "data analytics", "data analyst", "machine learning", "ml engineering",
            "artificial intelligence", "ai", "deep learning", "nlp",
            "natural language processing", "computer vision",
            "cybersecurity", "information security", "network security",
            "penetration testing", "ethical hacking", "security engineering",
            "game development", "game design", "game developer",
            "devops", "site reliability engineering", "sre", "platform engineering",
            "cloud computing", "cloud engineering", "cloud architecture",
            "web development", "web developer", "frontend development",
            "frontend developer", "frontend engineer", "backend development",
            "backend developer", "backend engineer", "fullstack development",
            "fullstack developer", "full stack", "full-stack",
            "mobile development", "mobile developer", "ios development",
            "ios developer", "android development", "android developer",
            "it", "information technology", "it support", "systems administration",
            "swe", "software", "programming", "coding", "developer",
            "blockchain", "web3", "cryptocurrency", "embedded systems",
            "firmware engineering", "robotics", "automation engineering",
            "database administration", "dba", "database engineering",
            "network engineering", "telecommunications", "it infrastructure",
            "quality assurance", "qa engineering", "test engineering",
            "technical writing", "developer relations", "devrel",
            "solution architecture", "solutions architect", "enterprise architecture",
            "quantitative development", "quant developer", "hpc",
            "augmented reality", "virtual reality", "ar/vr", "xr",
            "bioinformatics", "computational biology", "digital forensics",
            "iot", "internet of things", "edge computing"
        };
        for (String s : tech) INDUSTRY_CATEGORY.put(s, "tech");

        String[] design = {
            "ux/ui design", "ux design", "ui design", "ux designer", "ui designer",
            "product design", "product designer", "graphic design", "graphic designer",
            "visual design", "visual designer", "interaction design",
            "communication design", "brand design", "brand identity",
            "logo design", "typography", "motion design", "motion graphics",
            "animation", "3d design", "3d modelling", "industrial design",
            "fashion design", "fashion designer", "textile design",
            "interior design", "interior designer", "spatial design",
            "service design", "design thinking", "design strategy",
            "illustration", "digital illustration", "character design",
            "concept art", "art direction", "creative direction",
            "experience design", "design research", "accessibility design",
            "design systems", "ui engineering", "design engineering",
            "packaging design", "print design", "publication design",
            "environmental design", "exhibition design", "wayfinding design"
        };
        for (String s : design) INDUSTRY_CATEGORY.put(s, "design");

        String[] business = {
            "product management", "product manager", "project management",
            "project manager", "program management", "program manager",
            "marketing", "digital marketing", "growth marketing",
            "content marketing", "performance marketing", "brand marketing",
            "marketing manager", "marketing analyst",
            "sales", "sales manager", "account management", "account executive",
            "business development", "strategy", "business strategy",
            "management consulting", "consulting", "consultant",
            "operations", "operations management", "business operations",
            "entrepreneurship", "startup", "founder", "co-founder",
            "human resources", "hr", "people operations", "talent acquisition",
            "recruiting", "recruitment", "talent management",
            "supply chain", "logistics", "procurement", "inventory management",
            "real estate", "property management", "real estate agent",
            "public relations", "pr", "communications", "corporate communications",
            "e-commerce", "retail", "merchandising", "category management",
            "customer success", "customer experience", "cx",
            "executive management", "general management", "chief of staff",
            "change management", "organizational development",
            "insurance", "risk management", "compliance",
            "import export", "international business", "trade"
        };
        for (String s : business) INDUSTRY_CATEGORY.put(s, "business");

        String[] finance = {
            "finance", "financial analysis", "financial analyst",
            "investment banking", "investment analyst", "investment management",
            "portfolio management", "portfolio manager", "asset management",
            "wealth management", "private equity", "venture capital", "vc",
            "hedge fund", "trading", "equity research", "fixed income",
            "derivatives", "quantitative finance", "quant", "quant analyst",
            "corporate finance", "financial planning", "fp&a",
            "accounting", "accountant", "auditing", "auditor",
            "tax", "tax advisor", "tax accountant", "cpa",
            "actuarial", "actuary", "actuarial science",
            "fintech", "financial technology", "payments",
            "banking", "commercial banking", "retail banking",
            "treasury", "financial risk", "credit analysis",
            "economics", "economist", "economic research",
            "cryptocurrency", "defi", "decentralised finance"
        };
        for (String s : finance) INDUSTRY_CATEGORY.put(s, "finance");

        String[] engineering = {
            "mechanical engineering", "mechanical engineer",
            "civil engineering", "civil engineer",
            "electrical engineering", "electrical engineer",
            "chemical engineering", "chemical engineer",
            "aerospace engineering", "aerospace engineer",
            "structural engineering", "structural engineer",
            "biomedical engineering", "biomedical engineer",
            "environmental engineering", "environmental engineer",
            "materials engineering", "materials scientist",
            "nuclear engineering", "nuclear engineer",
            "petroleum engineering", "petroleum engineer",
            "mining engineering", "mining engineer",
            "geotechnical engineering", "geotechnical engineer",
            "manufacturing engineering", "manufacturing engineer",
            "process engineering", "process engineer",
            "systems engineering", "systems engineer",
            "industrial engineering", "industrial engineer",
            "renewable energy", "solar energy", "wind energy",
            "energy engineering", "power engineering",
            "automotive engineering", "automotive",
            "marine engineering", "marine engineer",
            "mechatronics", "mechatronic engineer",
            "control systems", "control engineer",
            "hydraulics", "geomatics", "surveying"
        };
        for (String s : engineering) INDUSTRY_CATEGORY.put(s, "engineering");

        String[] science = {
            "environmental science", "environmental scientist",
            "biology", "biologist", "microbiology", "microbiologist",
            "biochemistry", "biochemist", "molecular biology",
            "genetics", "genomics", "ecology",
            "chemistry", "chemist", "organic chemistry", "inorganic chemistry",
            "physics", "physicist", "astrophysics", "astronomy",
            "geology", "geologist", "geoscience", "earth science",
            "oceanography", "meteorology", "climate science",
            "psychology", "psychologist", "cognitive science",
            "neuroscience", "neuroscientist",
            "mathematics", "mathematician", "statistics", "statistician",
            "research", "research scientist", "scientific research",
            "pharmacology", "toxicology",
            "food science", "nutrition science", "dietetics",
            "sports science", "kinesiology", "exercise science",
            "anthropology", "archaeology", "forensic science",
            "zoology", "botany", "marine biology", "conservation biology"
        };
        for (String s : science) INDUSTRY_CATEGORY.put(s, "science");

        String[] healthcare = {
            "healthcare", "medicine", "medical", "doctor", "physician",
            "general practice", "gp", "specialist", "surgery", "surgeon",
            "nursing", "nurse", "registered nurse", "nurse practitioner",
            "pharmacy", "pharmacist", "pharmaceutical",
            "dentistry", "dentist", "dental", "orthodontics",
            "physiotherapy", "physiotherapist", "physical therapy",
            "occupational therapy", "occupational therapist",
            "speech therapy", "speech pathology",
            "optometry", "optometrist", "ophthalmology",
            "radiology", "radiologist", "pathology", "pathologist",
            "emergency medicine", "paramedic", "ems",
            "mental health", "psychiatry", "psychiatrist",
            "counselling", "counsellor", "therapist",
            "public health", "epidemiology", "epidemiologist",
            "health administration", "hospital management",
            "clinical research", "clinical trials",
            "dietitian", "nutritionist",
            "midwifery", "midwife", "obstetrics",
            "aged care", "disability services", "palliative care",
            "chiropractic", "chiropractor", "podiatry", "podiatrist",
            "medical imaging", "sonography"
        };
        for (String s : healthcare) INDUSTRY_CATEGORY.put(s, "healthcare");

        String[] creative = {
            "arts", "artist", "fine arts", "visual arts", "contemporary art",
            "painting", "sculpture", "printmaking", "ceramics",
            "music", "musician", "music production", "music producer",
            "sound design", "audio engineering", "mixing", "mastering",
            "songwriting", "composer", "dj",
            "film production", "filmmaking", "film director", "cinematography",
            "screenwriting", "video production", "documentary",
            "photography", "photographer", "photo editing",
            "creative writing", "fiction writing", "copywriting",
            "content creation", "content creator", "blogging", "vlogging",
            "journalism", "journalist", "photojournalism",
            "culinary arts", "chef", "pastry chef", "cooking", "baking",
            "architecture", "architect",
            "performing arts", "acting", "theatre", "dance", "choreography",
            "comedy", "stand-up", "voice acting",
            "crafts", "jewellery making", "woodworking",
            "tattoo artist", "makeup artist", "hairstylist",
            "creative arts", "creative industries",
            "game art", "concept art", "storyboarding"
        };
        for (String s : creative) INDUSTRY_CATEGORY.put(s, "creative");

        String[] education = {
            "education", "teaching", "teacher", "educator",
            "primary school teacher", "secondary school teacher",
            "high school teacher", "elementary teacher",
            "university lecturer", "lecturer", "professor",
            "academic", "academia", "research fellow",
            "tutoring", "tutor", "private tutor",
            "special education", "early childhood education",
            "curriculum development", "instructional design",
            "e-learning", "educational technology", "edtech",
            "school administration", "principal", "school counsellor",
            "library science", "librarian",
            "adult education", "vocational training", "tafe",
            "language teaching", "esl", "tefl", "tesol",
            "coaching", "mentoring", "learning and development", "l&d",
            "corporate training", "training and development"
        };
        for (String s : education) INDUSTRY_CATEGORY.put(s, "education");

        String[] law = {
            "law", "legal", "lawyer", "attorney", "solicitor", "barrister",
            "corporate law", "commercial law", "contract law",
            "criminal law", "criminal defence", "prosecution",
            "family law", "immigration law", "employment law",
            "intellectual property", "ip law", "patent law", "trademark",
            "property law", "real estate law", "conveyancing",
            "environmental law", "tax law", "international law",
            "human rights law", "public law", "constitutional law",
            "litigation", "dispute resolution", "mediation", "arbitration",
            "legal counsel", "in-house counsel", "general counsel",
            "paralegal", "legal assistant", "legal researcher",
            "compliance", "regulatory affairs", "government affairs",
            "public policy", "policy analyst", "policy advisor"
        };
        for (String s : law) INDUSTRY_CATEGORY.put(s, "law");

        String[] social = {
            "social work", "social worker", "community services",
            "community development", "community worker",
            "non-profit", "ngo", "charity", "humanitarian",
            "international development", "aid worker",
            "urban planning", "town planning", "urban design",
            "housing", "homelessness services",
            "youth work", "youth worker", "youth development",
            "disability support", "disability worker",
            "aged care worker", "care worker",
            "volunteer management", "fundraising",
            "advocacy", "policy advocacy", "political science",
            "politics", "government", "public administration",
            "diplomacy", "international relations",
            "sociology", "criminology", "social research"
        };
        for (String s : social) INDUSTRY_CATEGORY.put(s, "social");

        String[] trades = {
            "plumbing", "plumber", "electrician", "electrical",
            "carpentry", "carpenter", "joinery", "joiner",
            "construction", "builder", "building",
            "painting and decorating", "tiling", "flooring",
            "roofing", "glazing", "masonry", "bricklaying",
            "welding", "fabrication", "metalwork",
            "hvac", "air conditioning", "refrigeration",
            "landscaping", "horticulture", "gardening",
            "automotive mechanic", "mechanic", "automotive repair",
            "panel beating", "auto body",
            "farming", "agriculture", "horticulture", "viticulture",
            "fishing", "aquaculture", "forestry",
            "mining", "drilling", "excavation"
        };
        for (String s : trades) INDUSTRY_CATEGORY.put(s, "trades");

        String[] hospitality = {
            "hospitality", "hotel management", "hotel",
            "restaurant management", "restaurant", "food and beverage",
            "barista", "bartending", "mixology",
            "event management", "event planning", "events",
            "tourism", "travel", "travel agent",
            "airline", "flight attendant", "aviation",
            "cruise", "accommodation", "resort",
            "catering", "food service", "kitchen hand",
            "concierge", "front of house", "back of house"
        };
        for (String s : hospitality) INDUSTRY_CATEGORY.put(s, "hospitality");

        String[] media = {
            "media", "broadcasting", "television", "tv production",
            "radio", "podcast", "podcasting",
            "advertising", "advertising agency", "ad creative",
            "public relations", "pr agency",
            "social media", "social media management", "social media marketing",
            "seo", "search engine optimisation", "digital advertising",
            "publishing", "book publishing", "editorial",
            "news", "news media", "print media", "online media",
            "entertainment", "talent management", "talent agent",
            "esports", "gaming media", "game journalism",
            "influencer", "content strategy", "brand strategy"
        };
        for (String s : media) INDUSTRY_CATEGORY.put(s, "media");

        String[] sports = {
            "sports", "sport", "athletics", "professional sport",
            "coaching", "sports coach", "athletic coaching",
            "personal training", "personal trainer", "fitness",
            "strength and conditioning", "physiotherapy",
            "sports management", "sports administration",
            "sports marketing", "sports media", "sports journalism",
            "esports", "sports analytics", "sports science",
            "gym management", "fitness instructor",
            "swimming", "surfing", "cycling", "running", "triathlon",
            "rugby", "football", "cricket", "basketball", "netball"
        };
        for (String s : sports) INDUSTRY_CATEGORY.put(s, "sports");
    }

    // Category Adjacency Graph
    public static final Map<String, Set<String>> ADJACENT_CATEGORIES = new HashMap<>();

    static {
        ADJACENT_CATEGORIES.put("tech",        new HashSet<>(Arrays.asList("design", "engineering", "business", "finance", "media", "science")));
        ADJACENT_CATEGORIES.put("design",      new HashSet<>(Arrays.asList("tech", "creative", "business", "media")));
        ADJACENT_CATEGORIES.put("business",    new HashSet<>(Arrays.asList("tech", "finance", "law", "media", "design", "social")));
        ADJACENT_CATEGORIES.put("finance",     new HashSet<>(Arrays.asList("business", "law", "tech")));
        ADJACENT_CATEGORIES.put("engineering", new HashSet<>(Arrays.asList("tech", "science", "trades")));
        ADJACENT_CATEGORIES.put("science",     new HashSet<>(Arrays.asList("engineering", "healthcare", "education", "tech")));
        ADJACENT_CATEGORIES.put("healthcare",  new HashSet<>(Arrays.asList("science", "education", "social")));
        ADJACENT_CATEGORIES.put("creative",    new HashSet<>(Arrays.asList("design", "media", "education")));
        ADJACENT_CATEGORIES.put("education",   new HashSet<>(Arrays.asList("science", "healthcare", "creative", "social", "sports")));
        ADJACENT_CATEGORIES.put("law",         new HashSet<>(Arrays.asList("business", "finance", "social")));
        ADJACENT_CATEGORIES.put("social",      new HashSet<>(Arrays.asList("education", "healthcare", "law", "business")));
        ADJACENT_CATEGORIES.put("media",       new HashSet<>(Arrays.asList("creative", "tech", "business", "design")));
        ADJACENT_CATEGORIES.put("trades",      new HashSet<>(Arrays.asList("engineering")));
        ADJACENT_CATEGORIES.put("hospitality", new HashSet<>(Arrays.asList("creative", "business", "social")));
        ADJACENT_CATEGORIES.put("sports",      new HashSet<>(Arrays.asList("education", "healthcare", "media")));
    }
}