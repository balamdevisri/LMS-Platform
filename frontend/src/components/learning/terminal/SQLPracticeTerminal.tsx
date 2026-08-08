import React, { useState, useEffect, useRef } from 'react';
import { Database, Play, RefreshCw, Table, List, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SQLPracticeTerminalProps {
  onCommandRun?: (cmd: string) => void;
  isNightMode?: boolean;
}

interface TableSchema {
  columns: string[];
  rows: Record<string, any>[];
}

interface DBState {
  currentDatabase: string;
  databases: string[];
  tables: Record<string, TableSchema>;
}

const INITIAL_DB_STATE: DBState = {
  currentDatabase: 'learning_db',
  databases: ['learning_db'],
  tables: {
    users: {
      columns: ['id', 'name', 'email', 'role'],
      rows: [
        { id: 1, name: 'Alice Cooper', email: 'alice@kaizenq.com', role: 'Student' },
        { id: 2, name: 'Bob Dylan', email: 'bob@kaizenq.com', role: 'Instructor' },
        { id: 3, name: 'Charlie Sheen', email: 'charlie@kaizenq.com', role: 'Student' }
      ]
    },
    courses: {
      columns: ['course_id', 'title', 'category', 'duration'],
      rows: [
        { course_id: 101, title: 'Database Fundamentals', category: 'SQL', duration: '4 Hours' },
        { course_id: 102, title: 'Advanced Querying', category: 'SQL', duration: '5 Hours' },
        { course_id: 201, title: 'Linux System Administration', category: 'Systems', duration: '8 Hours' }
      ]
    }
  }
};

const PRACTICE_QUERIES = [
  { label: 'Show Tables', sql: 'SHOW TABLES;' },
  { label: 'Select All Users', sql: 'SELECT * FROM users;' },
  { label: 'Filter Students', sql: "SELECT id, name, email FROM users WHERE role = 'Student';" },
  { label: 'Insert New User', sql: "INSERT INTO users (id, name, email, role) VALUES (4, 'Dave Grohl', 'dave@kaizenq.com', 'Student');" },
  { label: 'Update Role', sql: "UPDATE users SET role = 'Administrator' WHERE id = 2;" },
  { label: 'Delete User', sql: 'DELETE FROM users WHERE id = 3;' },
  { label: 'Create Table', sql: 'CREATE TABLE products (product_id INT, name VARCHAR(50), price DECIMAL);' },
  { label: 'Alter Table', sql: 'ALTER TABLE users ADD COLUMN age INT;' },
  { label: 'Drop Products', sql: 'DROP TABLE products;' }
];

export const SQLPracticeTerminal: React.FC<SQLPracticeTerminalProps> = ({ onCommandRun }) => {
  const [dbState, setDbState] = useState<DBState>(() => {
    const saved = localStorage.getItem('shaivika_sql_db_state');
    return saved ? JSON.parse(saved) : INITIAL_DB_STATE;
  });

  const [query, setQuery] = useState('SELECT * FROM users;');
  const [outputType, setOutputType] = useState<'success' | 'error' | 'table'>('success');
  const [successMessage, setSuccessMessage] = useState('SQL terminal ready. Choose a practice query or write your own SQL.');
  const [errorMessage, setErrorMessage] = useState('');
  const [outputTable, setOutputTable] = useState<TableSchema | null>({
    columns: INITIAL_DB_STATE.tables.users.columns,
    rows: INITIAL_DB_STATE.tables.users.rows
  });

  const consoleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('shaivika_sql_db_state', JSON.stringify(dbState));
  }, [dbState]);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [successMessage, errorMessage, outputTable]);

  const handleReset = () => {
    setDbState(INITIAL_DB_STATE);
    setOutputType('success');
    setSuccessMessage('Database state reset successfully.');
    setOutputTable({
      columns: INITIAL_DB_STATE.tables.users.columns,
      rows: INITIAL_DB_STATE.tables.users.rows
    });
    setErrorMessage('');
    toast.success('Database has been reset.');
  };

  const handleExecute = () => {
    const trimmed = query.trim().replace(/;$/, '');
    if (!trimmed) return;

    if (onCommandRun) {
      onCommandRun(query);
    }

    const tokens = trimmed.split(/\s+/);
    const command = tokens[0].toUpperCase();

    try {
      // 1. SHOW TABLES
      if (trimmed.toUpperCase() === 'SHOW TABLES') {
        const tableNames = Object.keys(dbState.tables);
        setOutputType('table');
        setOutputTable({
          columns: ['Tables_in_' + dbState.currentDatabase],
          rows: tableNames.map(name => ({ ['Tables_in_' + dbState.currentDatabase]: name }))
        });
        setSuccessMessage(`Found ${tableNames.length} tables.`);
        return;
      }

      // 2. CREATE DATABASE
      if (command === 'CREATE' && tokens[1]?.toUpperCase() === 'DATABASE') {
        const dbName = tokens[2];
        if (!dbName) throw new Error('Database name not specified.');
        if (dbState.databases.includes(dbName)) {
          throw new Error(`Database '${dbName}' already exists.`);
        }
        setDbState(prev => ({
          ...prev,
          databases: [...prev.databases, dbName]
        }));
        setOutputType('success');
        setSuccessMessage(`Database '${dbName}' created successfully. Query OK, 1 row affected.`);
        return;
      }

      // 3. DROP TABLE
      if (command === 'DROP' && tokens[1]?.toUpperCase() === 'TABLE') {
        const tableName = tokens[2]?.toLowerCase();
        if (!tableName) throw new Error('Table name not specified.');
        if (!dbState.tables[tableName]) {
          throw new Error(`Table '${tableName}' does not exist.`);
        }
        setDbState(prev => {
          const nextTables = { ...prev.tables };
          delete nextTables[tableName];
          return { ...prev, tables: nextTables };
        });
        setOutputType('success');
        setSuccessMessage(`Table '${tableName}' dropped successfully. Query OK, 0 rows affected.`);
        setOutputTable(null);
        return;
      }

      // 4. CREATE TABLE
      if (command === 'CREATE' && tokens[1]?.toUpperCase() === 'TABLE') {
        const createMatch = trimmed.match(/CREATE\s+TABLE\s+(\w+)\s*\(([^)]+)\)/i);
        if (!createMatch) {
          throw new Error("Invalid CREATE TABLE syntax. Usage: CREATE TABLE table_name (col1 TYPE, col2 TYPE);");
        }
        const tableName = createMatch[1].toLowerCase();
        const colsString = createMatch[2];
        if (dbState.tables[tableName]) {
          throw new Error(`Table '${tableName}' already exists.`);
        }

        const columns = colsString.split(',').map(c => c.trim().split(/\s+/)[0]);
        setDbState(prev => ({
          ...prev,
          tables: {
            ...prev.tables,
            [tableName]: { columns, rows: [] }
          }
        }));
        setOutputType('success');
        setSuccessMessage(`Table '${tableName}' created successfully. Query OK, 0 rows affected.`);
        setOutputTable(null);
        return;
      }

      // 5. ALTER TABLE
      if (command === 'ALTER' && tokens[1]?.toUpperCase() === 'TABLE') {
        const tableName = tokens[2]?.toLowerCase();
        if (!tableName || !dbState.tables[tableName]) {
          throw new Error(`Table '${tableName || 'unspecified'}' does not exist.`);
        }
        const action = tokens[3]?.toUpperCase();
        if (action === 'ADD' && tokens[4]?.toUpperCase() === 'COLUMN') {
          const colName = tokens[5];
          if (!colName) throw new Error('Column name not specified.');
          if (dbState.tables[tableName].columns.includes(colName)) {
            throw new Error(`Column '${colName}' already exists.`);
          }
          setDbState(prev => {
            const nextTables = { ...prev.tables };
            const currentTable = nextTables[tableName];
            const updatedRows = currentTable.rows.map(row => ({ ...row, [colName]: null }));
            nextTables[tableName] = {
              columns: [...currentTable.columns, colName],
              rows: updatedRows
            };
            return { ...prev, tables: nextTables };
          });
          setOutputType('success');
          setSuccessMessage(`Table altered. Column '${colName}' added. Query OK, ${dbState.tables[tableName].rows.length} rows updated.`);
          return;
        }
        throw new Error('Unsupported ALTER TABLE syntax. Supported: ALTER TABLE name ADD COLUMN col TYPE');
      }

      // 6. INSERT INTO
      if (command === 'INSERT' && tokens[1]?.toUpperCase() === 'INTO') {
        const insertMatch = trimmed.match(/INSERT\s+INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\(([^)]+)\)/i);
        if (!insertMatch) {
          throw new Error("Invalid INSERT INTO syntax. Usage: INSERT INTO table_name (c1, c2) VALUES (v1, v2);");
        }
        const tableName = insertMatch[1].toLowerCase();
        const colsSpec = insertMatch[2];
        const valsSpec = insertMatch[3];

        if (!dbState.tables[tableName]) {
          throw new Error(`Table '${tableName}' does not exist.`);
        }

        const table = dbState.tables[tableName];
        const valArray = valsSpec.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        const colArray = colsSpec 
          ? colsSpec.split(',').map(c => c.trim()) 
          : table.columns;

        if (valArray.length !== colArray.length) {
          throw new Error('Value count does not match column count.');
        }

        const newRow: Record<string, any> = {};
        table.columns.forEach(col => {
          newRow[col] = null;
        });

        colArray.forEach((col, idx) => {
          if (!table.columns.includes(col)) {
            throw new Error(`Column '${col}' not found in table '${tableName}'.`);
          }
          const val = valArray[idx];
          // Simple number parser
          newRow[col] = isNaN(Number(val)) ? val : Number(val);
        });

        setDbState(prev => {
          const nextTables = { ...prev.tables };
          nextTables[tableName] = {
            ...nextTables[tableName],
            rows: [...nextTables[tableName].rows, newRow]
          };
          return { ...prev, tables: nextTables };
        });

        setOutputType('success');
        setSuccessMessage('Query OK, 1 row affected.');
        return;
      }

      // 7. SELECT
      if (command === 'SELECT') {
        const selectMatch = trimmed.match(/SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*))?/i);
        if (!selectMatch) {
          throw new Error("Unsupported query or syntax error. Simple SELECT supported: SELECT columns FROM table WHERE condition;");
        }
        const selectColsRaw = selectMatch[1].trim();
        const tableName = selectMatch[2].toLowerCase();
        const whereClause = selectMatch[3];

        if (!dbState.tables[tableName]) {
          throw new Error(`Table '${tableName}' does not exist.`);
        }

        const table = dbState.tables[tableName];
        let targetCols = selectColsRaw === '*' 
          ? table.columns 
          : selectColsRaw.split(',').map(c => c.trim());

        // Validate columns
        targetCols.forEach(col => {
          if (!table.columns.includes(col)) {
            throw new Error(`Column '${col}' does not exist in table '${tableName}'.`);
          }
        });

        let filteredRows = [...table.rows];

        if (whereClause) {
          const whereMatch = whereClause.match(/(\w+)\s*(=|!=|>|<)\s*(.*)/);
          if (whereMatch) {
            const col = whereMatch[1].trim();
            const operator = whereMatch[2];
            const val = whereMatch[3].trim().replace(/^['"]|['"]$/g, '');

            if (!table.columns.includes(col)) {
              throw new Error(`Column '${col}' in WHERE clause does not exist.`);
            }

            filteredRows = filteredRows.filter(row => {
              const rowVal = String(row[col]);
              if (operator === '=') return rowVal === val;
              if (operator === '!=') return rowVal !== val;
              if (operator === '>') return Number(rowVal) > Number(val);
              if (operator === '<') return Number(rowVal) < Number(val);
              return false;
            });
          } else {
            throw new Error('Unsupported WHERE clause condition. Supported: col = val, col > val, etc.');
          }
        }

        const resultRows = filteredRows.map(row => {
          const selectedRow: Record<string, any> = {};
          targetCols.forEach(col => {
            selectedRow[col] = row[col];
          });
          return selectedRow;
        });

        setOutputType('table');
        setOutputTable({
          columns: targetCols,
          rows: resultRows
        });
        setSuccessMessage(`Returned ${resultRows.length} rows.`);
        return;
      }

      // 8. UPDATE
      if (command === 'UPDATE') {
        const updateMatch = trimmed.match(/UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?/i);
        if (!updateMatch) {
          throw new Error("Invalid UPDATE syntax. Usage: UPDATE table SET col=val WHERE cond;");
        }
        const tableName = updateMatch[1].toLowerCase();
        const setSpec = updateMatch[2];
        const whereClause = updateMatch[3];

        if (!dbState.tables[tableName]) {
          throw new Error(`Table '${tableName}' does not exist.`);
        }

        const table = dbState.tables[tableName];
        // Parse set expressions: col = val
        const setMatch = setSpec.match(/(\w+)\s*=\s*(.*)/);
        if (!setMatch) throw new Error('Unsupported SET expression.');
        const setCol = setMatch[1].trim();
        const setVal = setMatch[2].trim().replace(/^['"]|['"]$/g, '');

        if (!table.columns.includes(setCol)) {
          throw new Error(`Column '${setCol}' does not exist.`);
        }

        let updatedCount = 0;
        const nextRows = table.rows.map(row => {
          let matches = true;
          if (whereClause) {
            const whereMatch = whereClause.match(/(\w+)\s*(=|!=|>|<)\s*(.*)/);
            if (whereMatch) {
              const col = whereMatch[1].trim();
              const op = whereMatch[2];
              const val = whereMatch[3].trim().replace(/^['"]|['"]$/g, '');
              const rowVal = String(row[col]);
              if (op === '=') matches = rowVal === val;
              else if (op === '!=') matches = rowVal !== val;
              else if (op === '>') matches = Number(rowVal) > Number(val);
              else if (op === '<') matches = Number(rowVal) < Number(val);
            }
          }
          if (matches) {
            updatedCount++;
            return {
              ...row,
              [setCol]: isNaN(Number(setVal)) ? setVal : Number(setVal)
            };
          }
          return row;
        });

        setDbState(prev => {
          const nextTables = { ...prev.tables };
          nextTables[tableName] = {
            ...nextTables[tableName],
            rows: nextRows
          };
          return { ...prev, tables: nextTables };
        });

        setOutputType('success');
        setSuccessMessage(`Query OK, ${updatedCount} rows affected.`);
        return;
      }

      // 9. DELETE
      if (command === 'DELETE' && tokens[1]?.toUpperCase() === 'FROM') {
        const tableName = tokens[2]?.toLowerCase();
        if (!tableName || !dbState.tables[tableName]) {
          throw new Error(`Table '${tableName || 'unspecified'}' does not exist.`);
        }
        const whereClause = trimmed.substring(trimmed.toUpperCase().indexOf('WHERE'));
        const table = dbState.tables[tableName];

        let deletedCount = 0;
        let nextRows: any[] = [];

        if (whereClause) {
          const whereMatch = whereClause.match(/WHERE\s+(\w+)\s*(=|!=|>|<)\s*(.*)/i);
          if (whereMatch) {
            const col = whereMatch[1].trim();
            const op = whereMatch[2];
            const val = whereMatch[3].trim().replace(/^['"]|['"]$/g, '');

            nextRows = table.rows.filter(row => {
              const rowVal = String(row[col]);
              let matches = false;
              if (op === '=') matches = rowVal === val;
              else if (op === '!=') matches = rowVal !== val;
              else if (op === '>') matches = Number(rowVal) > Number(val);
              else if (op === '<') matches = Number(rowVal) < Number(val);
              
              if (matches) deletedCount++;
              return !matches;
            });
          } else {
            throw new Error('Unsupported WHERE clause syntax.');
          }
        } else {
          deletedCount = table.rows.length;
          nextRows = [];
        }

        setDbState(prev => {
          const nextTables = { ...prev.tables };
          nextTables[tableName] = {
            ...nextTables[tableName],
            rows: nextRows
          };
          return { ...prev, tables: nextTables };
        });

        setOutputType('success');
        setSuccessMessage(`Query OK, ${deletedCount} rows affected.`);
        return;
      }

      throw new Error(`Unsupported SQL command: ${command}. Try SHOW TABLES, SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER.`);
    } catch (err: any) {
      setOutputType('error');
      setErrorMessage(err.message || String(err));
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl text-slate-100 font-sans min-h-[500px]">
      
      {/* Dynamic Schema Sidebar */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-4 flex flex-col gap-4 select-none">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase text-xs tracking-wider">
          <Database className="w-4 h-4" />
          <span>Active Schema</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between">
          <div>
            <h5 className="text-[10px] text-slate-400 uppercase font-bold">Current Database</h5>
            <p className="text-xs font-mono font-extrabold text-cyan-300">{dbState.currentDatabase}</p>
          </div>
          <button 
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset Database to Default state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[250px] lg:max-h-none">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Table className="w-3 h-3 text-cyan-400" />
            <span>Tables ({Object.keys(dbState.tables).length})</span>
          </div>

          <div className="space-y-1.5">
            {Object.entries(dbState.tables).map(([tableName, val]) => (
              <div key={tableName} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-900 hover:border-slate-800 transition-all">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-100 font-bold mb-1">
                  <span>{tableName}</span>
                  <span className="text-[9px] text-slate-500 font-sans font-medium">{val.rows.length} rows</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {val.columns.map(col => (
                    <span key={col} className="px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-850 text-[9px] text-slate-400 font-mono">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Console Area */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Editor Wrapper */}
        <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
              SQL Query Editor
            </span>
            <button
              onClick={handleExecute}
              className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-cyan-500/10 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Query</span>
            </button>
          </div>
          
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-4 bg-slate-900 text-white font-mono text-xs focus:outline-none resize-none leading-relaxed"
            placeholder="Write SQL statements here..."
            spellCheck={false}
          />
        </div>

        {/* Preset Practice Queries */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <List className="w-3 h-3 text-cyan-400" />
            <span>Practice Queries (Click to load)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRACTICE_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(pq.sql)}
                className="py-1 px-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition-all cursor-pointer"
              >
                {pq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Console */}
        <div className="flex-1 border border-slate-800 rounded-2xl overflow-hidden bg-[#0d1117] flex flex-col min-h-[160px]">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center text-xs font-bold text-slate-400">
            Output Log Console
          </div>
          
          <div ref={consoleContainerRef} className="flex-1 p-4 font-mono text-xs overflow-auto">
            {outputType === 'error' && (
              <div className="p-3.5 rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-extrabold uppercase text-[10px] tracking-wide text-red-500 mb-1">SQL Execution Error</h6>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {outputType === 'success' && (
              <div className="p-3.5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 text-emerald-300 flex gap-2.5 items-start">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-extrabold uppercase text-[10px] tracking-wide text-emerald-400 mb-0.5">Query Executed Successfully</h6>
                  <p className="leading-relaxed">{successMessage}</p>
                </div>
              </div>
            )}

            {outputType === 'table' && outputTable && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-w-full">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-850">
                        {outputTable.columns.map(col => (
                          <th key={col} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300 border-r border-slate-850 last:border-r-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {outputTable.rows.length > 0 ? (
                        outputTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-850 last:border-b-0 hover:bg-slate-900/40">
                            {outputTable.columns.map(col => (
                              <td key={col} className="px-3 py-1.5 text-slate-200 border-r border-slate-850 last:border-r-0">
                                {row[col] === null ? <em className="text-slate-600">NULL</em> : String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={outputTable.columns.length} className="px-3 py-4 text-center text-slate-500 italic">
                            Empty set (no rows returned)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
