<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    
    <xsl:template match="/">
        <html>
            <head>
                <title>Lafayette Equipment Rentals - XML Sitemap</title>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
                        min-height: 100vh;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                        color: white;
                        padding: 3rem 2rem;
                        text-align: center;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    
                    .header h1 {
                        font-size: 2.5rem;
                        font-weight: 800;
                        margin-bottom: 0.5rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .header p {
                        font-size: 1.2rem;
                        opacity: 0.95;
                        margin-bottom: 1rem;
                    }
                    
                    .stats {
                        display: flex;
                        justify-content: center;
                        gap: 3rem;
                        margin-top: 2rem;
                        flex-wrap: wrap;
                    }
                    
                    .stat {
                        background: rgba(255,255,255,0.2);
                        padding: 1rem 2rem;
                        border-radius: 8px;
                        backdrop-filter: blur(10px);
                    }
                    
                    .stat-number {
                        font-size: 2rem;
                        font-weight: bold;
                        color: #facc15;
                    }
                    
                    .stat-label {
                        font-size: 0.9rem;
                        text-transform: uppercase;
                        opacity: 0.9;
                    }
                    
                    .container {
                        max-width: 1400px;
                        margin: 2rem auto;
                        padding: 0 2rem;
                    }
                    
                    .info-box {
                        background: white;
                        border-radius: 12px;
                        padding: 2rem;
                        margin-bottom: 2rem;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.07);
                        border-left: 4px solid #dc2626;
                    }
                    
                    .info-box h2 {
                        color: #dc2626;
                        margin-bottom: 1rem;
                        font-size: 1.5rem;
                    }
                    
                    .info-box p {
                        color: #666;
                        line-height: 1.8;
                    }
                    
                    .table-container {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.07);
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    
                    thead {
                        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                        color: white;
                    }
                    
                    th {
                        padding: 1.2rem 1rem;
                        text-align: left;
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 0.875rem;
                        letter-spacing: 0.5px;
                    }
                    
                    td {
                        padding: 1rem;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    
                    tbody tr:hover {
                        background: #f9fafb;
                        transition: background 0.2s;
                    }
                    
                    tbody tr:last-child td {
                        border-bottom: none;
                    }
                    
                    .url-cell {
                        font-family: 'Monaco', 'Courier New', monospace;
                        font-size: 0.875rem;
                        color: #0066cc;
                        word-break: break-all;
                    }
                    
                    .url-cell a {
                        color: #0066cc;
                        text-decoration: none;
                    }
                    
                    .url-cell a:hover {
                        text-decoration: underline;
                        color: #dc2626;
                    }
                    
                    .date-cell {
                        color: #6b7280;
                        font-size: 0.875rem;
                        white-space: nowrap;
                    }
                    
                    .freq-cell {
                        color: #059669;
                        font-weight: 500;
                        text-transform: capitalize;
                    }
                    
                    .priority-cell {
                        font-weight: 600;
                        text-align: center;
                    }
                    
                    .priority-high {
                        color: #dc2626;
                        background: #fef2f2;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        display: inline-block;
                    }
                    
                    .priority-medium {
                        color: #d97706;
                        background: #fef3c7;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        display: inline-block;
                    }
                    
                    .priority-low {
                        color: #059669;
                        background: #d1fae5;
                        padding: 0.25rem 0.75rem;
                        border-radius: 20px;
                        display: inline-block;
                    }
                    
                    .alternates {
                        display: flex;
                        gap: 0.5rem;
                        flex-wrap: wrap;
                    }
                    
                    .lang-badge {
                        background: #e5e7eb;
                        color: #374151;
                        padding: 0.2rem 0.5rem;
                        border-radius: 4px;
                        font-size: 0.75rem;
                        font-weight: 500;
                        text-transform: uppercase;
                    }
                    
                    .footer {
                        text-align: center;
                        padding: 3rem 2rem;
                        color: #6b7280;
                        font-size: 0.875rem;
                    }
                    
                    .footer a {
                        color: #dc2626;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    
                    .footer a:hover {
                        text-decoration: underline;
                    }
                    
                    @media (max-width: 768px) {
                        .header h1 {
                            font-size: 1.8rem;
                        }
                        
                        .stats {
                            gap: 1rem;
                        }
                        
                        .table-container {
                            overflow-x: auto;
                        }
                        
                        table {
                            min-width: 600px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Lafayette Equipment Rentals</h1>
                    <p>XML Sitemap for Search Engines</p>
                    <div class="stats">
                        <div class="stat">
                            <div class="stat-number">
                                <xsl:value-of select="count(//sitemap:url)"/>
                            </div>
                            <div class="stat-label">Total URLs</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">
                                <xsl:value-of select="count(//sitemap:url[sitemap:priority &gt;= 0.8])"/>
                            </div>
                            <div class="stat-label">High Priority</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">
                                <xsl:value-of select="count(//xhtml:link)"/>
                            </div>
                            <div class="stat-label">Alternate Links</div>
                        </div>
                    </div>
                </div>
                
                <div class="container">
                    <div class="info-box">
                        <h2>About This Sitemap</h2>
                        <p>
                            This XML sitemap is designed to help search engines discover and index all pages on Lafayette Equipment Rentals' website. 
                            It includes equipment listings, location-specific pages, blog articles, and industry-specific content. 
                            The sitemap is automatically updated regularly to ensure search engines have the most current information about our site structure.
                        </p>
                    </div>
                    
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 5%">#</th>
                                    <th style="width: 45%">URL</th>
                                    <th style="width: 15%">Last Modified</th>
                                    <th style="width: 15%">Change Frequency</th>
                                    <th style="width: 10%">Priority</th>
                                    <th style="width: 10%">Languages</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select="//sitemap:url">
                                    <xsl:sort select="sitemap:priority" order="descending"/>
                                    <tr>
                                        <td>
                                            <xsl:value-of select="position()"/>
                                        </td>
                                        <td class="url-cell">
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:value-of select="sitemap:loc"/>
                                                </xsl:attribute>
                                                <xsl:value-of select="sitemap:loc"/>
                                            </a>
                                        </td>
                                        <td class="date-cell">
                                            <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                                        </td>
                                        <td class="freq-cell">
                                            <xsl:value-of select="sitemap:changefreq"/>
                                        </td>
                                        <td class="priority-cell">
                                            <xsl:choose>
                                                <xsl:when test="sitemap:priority &gt;= 0.8">
                                                    <span class="priority-high">
                                                        <xsl:value-of select="sitemap:priority"/>
                                                    </span>
                                                </xsl:when>
                                                <xsl:when test="sitemap:priority &gt;= 0.5">
                                                    <span class="priority-medium">
                                                        <xsl:value-of select="sitemap:priority"/>
                                                    </span>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <span class="priority-low">
                                                        <xsl:value-of select="sitemap:priority"/>
                                                    </span>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </td>
                                        <td>
                                            <div class="alternates">
                                                <xsl:if test="contains(sitemap:loc, '/en/')">
                                                    <span class="lang-badge">EN</span>
                                                </xsl:if>
                                                <xsl:if test="contains(sitemap:loc, '/es/')">
                                                    <span class="lang-badge">ES</span>
                                                </xsl:if>
                                                <xsl:if test="xhtml:link">
                                                    <xsl:for-each select="xhtml:link">
                                                        <span class="lang-badge">
                                                            <xsl:value-of select="translate(@hreflang, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/>
                                                        </span>
                                                    </xsl:for-each>
                                                </xsl:if>
                                            </div>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="footer">
                    <p>
                        Generated on <xsl:value-of select="substring(//sitemap:url[1]/sitemap:lastmod, 1, 10)"/> • 
                        <a href="https://www.lafayetteequipmentrental.com">Visit Lafayette Equipment Rentals</a> • 
                        <a href="https://www.lafayetteequipmentrental.com/contact">Contact Us</a>
                    </p>
                    <p style="margin-top: 1rem;">
                        © Lafayette Equipment Rentals - Heavy Equipment Rental Services in Lafayette, LA
                    </p>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>