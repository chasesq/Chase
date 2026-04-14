import { GuideLayout } from '@/components/guides/guide-layout'
import { GuideNavigation } from '@/components/guides/guide-navigation'
import { CodeExampleBlock } from '@/components/guides/code-example-block'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Other Languages Connection Guide | Neon Guides',
  description: 'Learn how to connect to Neon from Python, Go, Rust, Java, PHP, Ruby, and other programming languages.',
}

export default function OtherLanguagesPage() {
  return (
    <GuideLayout
      title="Other Languages & Frameworks"
      description="Connect to Neon from Python, Go, Rust, Java, PHP, Ruby, and other programming languages."
      breadcrumbs={[
        { label: 'Neon Connection Guide', href: '/guides/neon-connection-guide' },
        { label: 'Other Languages' },
      ]}
      sidebar={<GuideNavigation />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            Non-JavaScript languages use standard PostgreSQL drivers with Neon&apos;s pooled connection strings. All languages can benefit from connection pooling through PgBouncer.
          </p>
          <p className="text-muted-foreground">
            For all non-JS/TS environments, use a native PostgreSQL driver with a pooled Neon connection string (one that includes <code className="bg-muted px-2 py-1 rounded text-xs">-pooler</code> in the hostname).
          </p>
        </section>

        {/* Quick Reference */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { lang: 'Python (psycopg)', pooling: 'Built-in connection pools' },
              { lang: 'Python (asyncpg)', pooling: 'AsyncIO pool support' },
              { lang: 'Go', pooling: 'sql.DB with max connections' },
              { lang: 'Rust', pooling: 'sqlx with connection pooling' },
              { lang: 'Java', pooling: 'HikariCP or similar' },
              { lang: 'PHP', pooling: 'PDO with persistent connections' },
              { lang: 'Ruby on Rails', pooling: 'ActiveRecord connection pool' },
              { lang: 'Elixir', pooling: 'Ecto connection pool' },
            ].map((item) => (
              <Card key={item.lang} className="p-4">
                <h4 className="font-semibold text-foreground">{item.lang}</h4>
                <p className="text-sm text-muted-foreground">{item.pooling}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Python */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Python</h3>
          <p className="text-muted-foreground mb-4">
            Python has several PostgreSQL drivers. For synchronous code, use psycopg2 or psycopg3. For async code, use asyncpg.
          </p>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">psycopg3 (Synchronous)</h4>
              <CodeExampleBlock
                title="psycopg3 Connection"
                description="Modern PostgreSQL adapter for Python"
                code={`import psycopg
import os

# Use pooled connection string
DATABASE_URL = os.getenv('DATABASE_URL')

try:
    conn = psycopg.connect(DATABASE_URL)
    cur = conn.cursor()
    cur.execute('SELECT NOW();')
    print(cur.fetchone())
    cur.close()
finally:
    conn.close()`}
              />
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">asyncpg (Async)</h4>
              <CodeExampleBlock
                title="asyncpg with Connection Pool"
                description="High-performance async PostgreSQL driver"
                code={`import asyncpg
import os

DATABASE_URL = os.getenv('DATABASE_URL')

async def main():
    # Create a connection pool
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=10, max_size=20)
    
    async with pool.acquire() as conn:
        result = await conn.fetchval('SELECT NOW()')
        print(result)
    
    await pool.close()

import asyncio
asyncio.run(main())`}
              />
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Django ORM</h4>
              <CodeExampleBlock
                title="Django Settings Configuration"
                description="Configure Django to use Neon"
                code={`# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'neondb',
        # Use the pooled connection string from Neon Console
        'USER': 'neondb_owner',
        'PASSWORD': 'your_password',
        'HOST': 'ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech',
        'PORT': '5432',
        'SSL': 'require',
    }
}`}
              />
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">SQLAlchemy with Connection Pool</h4>
              <CodeExampleBlock
                title="SQLAlchemy ORM Setup"
                description="Python ORM with Neon"
                code={`from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv('DATABASE_URL')

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=10,  # Number of connections to keep
    max_overflow=20,  # Additional overflow connections
    pool_pre_ping=True,  # Test connections before use
    ssl={'sslmode': 'require'}
)

with engine.connect() as conn:
    result = conn.execute(text('SELECT NOW()'))
    print(result.scalar())`}
              />
            </div>
          </div>
        </section>

        {/* Go */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Go</h3>
          <p className="text-muted-foreground mb-4">
            Use the standard <code className="bg-muted px-2 py-1 rounded text-xs">pq</code> driver or modern alternatives like <code className="bg-muted px-2 py-1 rounded text-xs">pgx</code>.
          </p>

          <CodeExampleBlock
            title="Go with pq Driver"
            description="Standard PostgreSQL driver for Go"
            code={`package main

import (
    "database/sql"
    "fmt"
    "os"
    _ "github.com/lib/pq"
)

func main() {
    // Use pooled connection string
    databaseURL := os.Getenv("DATABASE_URL")
    
    db, err := sql.Open("postgres", databaseURL)
    if err != nil {
        panic(err)
    }
    defer db.Close()
    
    // Configure connection pool
    db.SetMaxOpenConns(25)
    db.SetMaxIdleConns(5)
    
    var now string
    err = db.QueryRow("SELECT NOW()").Scan(&now)
    if err != nil {
        panic(err)
    }
    fmt.Println(now)
}`}
          />
        </section>

        {/* Rust */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Rust</h3>
          <p className="text-muted-foreground mb-4">
            Use SQLx for compile-time safe SQL queries and automatic connection pooling.
          </p>

          <CodeExampleBlock
            title="Rust with SQLx"
            description="Type-safe async database access"
            code={`use sqlx::postgres::PgPoolOptions;
use sqlx::Row;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let database_url = env::var("DATABASE_URL")?;
    
    // Create a connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    
    // Execute a query
    let row = sqlx::query("SELECT NOW()")
        .fetch_one(&pool)
        .await?;
    
    let now: String = row.get(0);
    println!("{}", now);
    
    Ok(())
}`}
          />
        </section>

        {/* Java */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Java</h3>
          <p className="text-muted-foreground mb-4">
            Use HikariCP (recommended) for production-grade connection pooling.
          </p>

          <CodeExampleBlock
            title="Java with HikariCP"
            description="High-performance JDBC connection pooling"
            code={`import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

public class NeonConnection {
    public static void main(String[] args) throws Exception {
        // Configure HikariCP
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(System.getenv("DATABASE_URL"));
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        
        HikariDataSource dataSource = new HikariDataSource(config);
        
        // Use the pool
        try (Connection conn = dataSource.getConnection()) {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT NOW()");
            while (rs.next()) {
                System.out.println(rs.getString(1));
            }
        } finally {
            dataSource.close();
        }
    }
}`}
          />
        </section>

        {/* PHP */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">PHP</h3>
          <p className="text-muted-foreground mb-4">
            Use PDO with persistent connections for better performance.
          </p>

          <CodeExampleBlock
            title="PHP with PDO"
            description="Database abstraction layer with connection pooling"
            code={`<?php
$databaseUrl = getenv('DATABASE_URL');

// Parse the connection string
$url = parse_url($databaseUrl);
$dsn = 'pgsql:host=' . $url['host'] . 
       ';port=' . ($url['port'] ?? 5432) . 
       ';dbname=' . ltrim($url['path'], '/');

try {
    $pdo = new PDO(
        $dsn,
        $url['user'],
        $url['pass'],
        [
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]
    );
    
    $stmt = $pdo->query('SELECT NOW()');
    echo $stmt->fetchColumn();
} catch (PDOException $e) {
    echo 'Error: ' . $e->getMessage();
}
?>`}
          />
        </section>

        {/* Ruby on Rails */}
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Ruby on Rails</h3>
          <p className="text-muted-foreground mb-4">
            Rails automatically manages connection pooling through ActiveRecord.
          </p>

          <CodeExampleBlock
            title="Rails Database Configuration"
            description="config/database.yml setup for Neon"
            code={`production:
  adapter: postgresql
  encoding: unicode
  database: neondb
  host: ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech
  username: neondb_owner
  password: <%= ENV['DATABASE_PASSWORD'] %>
  pool: 25
  timeout: 5000
  sslmode: require`}
          />
        </section>

        {/* Connection Pool Best Practices */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Connection Pool Best Practices</h2>
          <div className="space-y-4">
            <Card className="p-4 border-blue-200 bg-blue-50">
              <h4 className="font-semibold text-foreground mb-2">Use Pooled Connection Strings</h4>
              <p className="text-sm text-foreground">
                Always use the pooled connection string from the Neon Console (includes <code className="bg-white px-2 py-1 rounded text-xs">-pooler</code> in hostname).
              </p>
            </Card>
            
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold text-foreground mb-2">Set Appropriate Pool Size</h4>
              <p className="text-sm text-foreground">
                Start with 5-10 connections. Increase only if you have high concurrency. Most applications don&apos;t need more than 20-25 connections.
              </p>
            </Card>
            
            <Card className="p-4 border-amber-200 bg-amber-50">
              <h4 className="font-semibold text-foreground mb-2">Test Connections</h4>
              <p className="text-sm text-foreground">
                Enable connection validation (test before use) to detect stale connections that may have been closed by Neon.
              </p>
            </Card>

            <Card className="p-4 border-purple-200 bg-purple-50">
              <h4 className="font-semibold text-foreground mb-2">Avoid Double Pooling</h4>
              <p className="text-sm text-foreground">
                Don&apos;t add client-side pooling on top of Neon&apos;s pooled connection. One layer of pooling is sufficient.
              </p>
            </Card>
          </div>
        </section>

        {/* Migration Considerations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Schema Migrations</h2>
          <p className="text-muted-foreground mb-4">
            For operations like schema migrations, use a direct connection string (without <code className="bg-muted px-2 py-1 rounded text-xs">-pooler</code>).
          </p>
          <Card className="p-4 border-amber-200 bg-amber-50">
            <p className="text-sm text-foreground">
              <strong>Migration Recommendation:</strong> Most frameworks handle this automatically. For frameworks that don&apos;t, use the direct connection string for migrations and the pooled string for the application.
            </p>
          </Card>
        </section>
      </div>
    </GuideLayout>
  )
}
