
db = db.getSiblingDB("asoftech");

/* =====================================================
   COLLECTIONS
===================================================== */

db.createCollection("scanner_jobs");
db.createCollection("scanner_results");
db.createCollection("website_audits");
db.createCollection("lead_scores");
db.createCollection("scan_schedules");

/* =====================================================
   INDEXES
===================================================== */

/* scanner_jobs */

db.scanner_jobs.createIndex(
 { orgId:1, createdAt:-1 }
);

db.scanner_jobs.createIndex(
 { orgId:1, status:1 }
);

/* scanner_results */

db.scanner_results.createIndex(
 { orgId:1, jobId:1 }
);

db.scanner_results.createIndex(
 { orgId:1, placeId:1 }
);

db.scanner_results.createIndex(
 { orgId:1, website:1 }
);

db.scanner_results.createIndex(
 { orgId:1, phone:1 }
);

db.scanner_results.createIndex(
 { orgId:1, dedupeHash:1 },
 { unique:true }
);

/* website_audits */

db.website_audits.createIndex(
 { orgId:1, resultId:1 }
);

db.website_audits.createIndex(
 { orgId:1, website:1 }
);

/* lead_scores */

db.lead_scores.createIndex(
 { orgId:1, resultId:1 }
);

db.lead_scores.createIndex(
 { orgId:1, grade:1 }
);

/* schedules */

db.scan_schedules.createIndex(
 { orgId:1, active:1 }
);

db.scan_schedules.createIndex(
 { orgId:1, cron:1 }
);

print("Phase 8A Collections Created");

