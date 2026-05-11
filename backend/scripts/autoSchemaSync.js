/**
 * backend/scripts/autoSchemaSync.js
 * 
 * Permanent Database Schema Self-Healing Engine.
 * Detects mismatches between backend models and Supabase tables.
 * Auto-generates and (if possible) applies migrations on startup.
 */

const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// ─────────────────────────────────────────
// RUNTIME SCHEMA MAP (Master Definition)
// ─────────────────────────────────────────

const REQUIRED_SCHEMA = {
  cases: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    title: 'TEXT',
    description: 'TEXT',
    status: 'TEXT DEFAULT \'active\'',
    priority: 'TEXT DEFAULT \'medium\'',
    assigned_agent: 'TEXT',
    assigned_to: 'TEXT',
    ai_confidence: 'FLOAT DEFAULT 0',
    threat_score: 'FLOAT DEFAULT 0',
    anomaly_count: 'INTEGER DEFAULT 0',
    investigation_type: 'TEXT',
    location: 'TEXT',
    geo_location: 'JSONB DEFAULT \'{}\'::jsonb',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    deleted_at: 'TIMESTAMP WITH TIME ZONE'
  },
  telemetry_events: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    event_type: 'TEXT',
    signal_type: 'TEXT',
    severity: 'TEXT',
    anomaly_score: 'FLOAT',
    ai_confidence: 'FLOAT',
    payload_json: 'JSONB DEFAULT \'{}\'::jsonb',
    metadata: 'JSONB DEFAULT \'{}\'::jsonb',
    source: 'TEXT',
    status: 'TEXT',
    event_time: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    timestamp: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  evidence: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    title: 'TEXT',
    name: 'TEXT',
    type: 'TEXT',
    status: 'TEXT DEFAULT \'pending\'',
    scan_status: 'TEXT DEFAULT \'pending\'',
    hash: 'TEXT',
    hash_sha256: 'TEXT',
    metadata_json: 'JSONB DEFAULT \'{}\'::jsonb',
    risk_score: 'FLOAT DEFAULT 0',
    ai_confidence: 'FLOAT DEFAULT 0',
    authenticity_score: 'FLOAT DEFAULT 100',
    tags: 'TEXT[]',
    uploaded_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  timeline_events: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    event_type: 'TEXT',
    type: 'TEXT',
    title: 'TEXT',
    description: 'TEXT',
    severity: 'TEXT',
    timestamp: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    confidence_score: 'FLOAT',
    source_type: 'TEXT',
    metadata_json: 'JSONB DEFAULT \'{}\'::jsonb',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  predictive_recommendations: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    recommendation: 'TEXT',
    action: 'TEXT',
    priority: 'TEXT',
    reasoning: 'TEXT',
    confidence: 'FLOAT',
    severity: 'TEXT',
    ai_reasoning: 'TEXT',
    payload: 'JSONB DEFAULT \'{}\'::jsonb',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  behavioral_patterns: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    subject_id: 'TEXT',
    pattern_type: 'TEXT',
    description: 'TEXT',
    confidence: 'FLOAT',
    similarity_score: 'FLOAT',
    data: 'JSONB DEFAULT \'{}\'::jsonb',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  deepfake_scans: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    evidence_id: 'UUID',
    scan_results: 'JSONB',
    probability: 'FLOAT',
    is_synthetic: 'BOOLEAN',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  toxicology_reports: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    substance: 'TEXT',
    concentration: 'TEXT',
    unit: 'TEXT',
    lethality_index: 'FLOAT',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  },
  ai_intelligence_feed: {
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    case_id: 'UUID',
    event_type: 'TEXT',
    title: 'TEXT',
    message: 'TEXT',
    severity: 'TEXT',
    source: 'TEXT',
    category: 'TEXT',
    payload: 'JSONB DEFAULT \'{}\'::jsonb',
    metadata: 'JSONB DEFAULT \'{}\'::jsonb',
    ai_confidence: 'FLOAT DEFAULT 0.8',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()'
  }
};

// ─────────────────────────────────────────
// AUTO SYNC LOGIC
// ─────────────────────────────────────────

async function autoSchemaSync() {
  logger.info('🚀 [AutoSchemaSync] Starting permanent self-healing check...');
  
  let sqlBuffer = [];
  
  for (const [tableName, columns] of Object.entries(REQUIRED_SCHEMA)) {
    try {
      // 1. Check if table exists (Best effort discovery via a dummy select)
      const { error: tableError } = await supabase.from(tableName).select('id').limit(1);
      
      if (tableError && (tableError.code === '42P01' || tableError.message.includes('not find'))) {
        logger.warn(`[AutoSchemaSync] TABLE MISSING: ${tableName}. Generating CREATE TABLE...`);
        const colDefs = Object.entries(columns).map(([name, def]) => `${name} ${def}`).join(', ');
        sqlBuffer.push(`CREATE TABLE IF NOT EXISTS public.${tableName} (${colDefs});`);
      } else {
        // 2. Check for missing columns
        for (const [colName, colDef] of Object.entries(columns)) {
          const { error: colError } = await supabase.from(tableName).select(colName).limit(1);
          if (colError && (colError.code === '42703' || colError.message.includes('not find'))) {
            logger.warn(`[AutoSchemaSync] COLUMN MISSING: ${tableName}.${colName}. Generating ALTER TABLE...`);
            sqlBuffer.push(`ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${colName} ${colDef.replace('PRIMARY KEY', '')};`);
          }
        }
      }
    } catch (err) {
      logger.error(`[AutoSchemaSync] Error inspecting ${tableName}:`, err.message);
    }
  }

  if (sqlBuffer.length === 0) {
    logger.info('✅ [AutoSchemaSync] Schema is fully synchronized and healthy.');
    return true;
  }

  const finalSql = sqlBuffer.join('\n');
  logger.warn(`[AutoSchemaSync] REQUIRED MIGRATIONS DETECTED:\n\n${finalSql}\n`);
  
  // Try to execute via an RPC if the user has defined one for us
  try {
    const { error: rpcError } = await supabase.rpc('run_sql', { sql: finalSql });
    if (!rpcError) {
      logger.info('✨ [AutoSchemaSync] Successfully applied migrations via RPC.');
      return true;
    }
    logger.debug('[AutoSchemaSync] RPC run_sql failed or missing. Please apply the SQL above manually in Supabase SQL Editor.');
  } catch (e) {
    logger.debug('[AutoSchemaSync] Migration execution skipped (no RPC).');
  }

  return false;
}

// ─────────────────────────────────────────
// SAFE INSERT WRAPPER
// ─────────────────────────────────────────

/**
 * Universally safe insert that prevents backend crashes on schema mismatch.
 * Retries with base fields if secondary columns are missing.
 */
async function safeInsert(tableName, data) {
  const payload = Array.isArray(data) ? data : [data];
  try {
    const { data: result, error } = await supabase.from(tableName).insert(payload).select();
    
    if (error) {
      if (error.code === '42703') { // Column missing
        const missingCol = error.message.match(/column "(.*)"/)?.[1] || 'unknown';
        logger.warn(`[SafeInsert] Schema mismatch on ${tableName}. Missing column: ${missingCol}. Retrying without it...`);
        
        // Strip the problematic column and retry
        const strippedPayload = payload.map(row => {
          const newRow = { ...row };
          delete newRow[missingCol];
          return newRow;
        });
        return safeInsert(tableName, strippedPayload);
      }
      
      if (error.code === '42P01') { // Table missing
        logger.error(`[SafeInsert] CRITICAL: Table ${tableName} does not exist. Schema sync failed to repair.`);
        return null;
      }
      
      throw error;
    }
    return result;
  } catch (err) {
    logger.error(`[SafeInsert] Final failure for ${tableName}:`, err.message);
    return null;
  }
}

module.exports = { autoSchemaSync, safeInsert, REQUIRED_SCHEMA };
