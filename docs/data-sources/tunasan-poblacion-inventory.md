# Tunasan and Poblacion pilot inventory

**Coverage: pilot listings in progress.** Source review date: **2026-10-27**. This inventory contains 27 public-service listings: 15 government offices, three health centers, and nine public education sites. It is a reviewed starting inventory, not a claim that every eligible facility has been found or that every facility is currently operating at the published address.

The pilot boundary is the physical location of a public-facing government office, government health facility, or government-run school/learning center in **Tunasan or Poblacion**. A service area or a name containing a barangay does not establish physical location. Private facilities and offices in other barangays are excluded. Separate public services can share one building; repeated program rows for one clinic do not create another facility.

## Evidence and unknown facts

[data/pilot-places.json](../../data/pilot-places.json) is the importable inventory. Each non-empty public field carries its own source row containing `fieldKey`, `sourceName`, `sourceUrl`, `sourceType`, and `checkedAt`. Repeated citations are intentional: evidence for a phone number does not silently establish an entrance or opening hours. Date checked means the source was reviewed, not that a volunteer visited the site.

All 182 source rows in this version are official sources. There are no site-visit or OpenStreetMap claims. No imported record is marked field-verified. The importer refuses records whose verification state has advanced beyond `awaiting_review` and uses database defaults for new records; the public UI must derive the official-source label from field sources rather than infer a visit.

Two school locations use DepEd project coordinates. The other 25 locations remain null. Barangay office street addresses remain null because the city profiles do not provide them; their entries represent the named barangay offices and must be reconciled to current physical counters before navigation can be offered. All entrance, wheelchair, and parking details remain unknown. Only the public library has sourced opening hours. Other schedules and clinic-specific services remain unknown. Contacts are published office contacts; no employee names are stored. Phone formatting is preserved from the source, including the City Health Office's unusual published formatting.

Four elementary-school addresses come from the **SY 2020-2021** masterlist. Their citation names retain that period, even though the source review occurred in 2026. The current National Inventory Dashboard corroborates the school identities. The 2026 allocation list supplies three secondary-school addresses. DepEd's PPP coordinates are **project coordinates, not a site visit**, and the citation says so. Confirm entrances and current addresses with each school before claiming navigation accuracy.

The controller's official-source research was reviewed on 2026-10-27. The city pages and current DepEd dashboard reopened during implementation. Some DepEd PDFs and the SDO directory returned HTTP 403 on a later reopen, and DOH pages timed out. The already-reviewed official facts and their exact source URLs are retained; those reopen failures do not establish that a facility is closed or that a published fact is current.

## Included government offices

All city and barangay page URLs below were reviewed on **2026-10-27**. The source rows in JSON identify the fields supported by each page.

| Stable key | Listing | Barangay | Official source and remaining uncertainty |
| --- | --- | --- | --- |
| `barangay-tunasan-office` | Barangay Tunasan Office | Tunasan | [City barangay profile](https://muntinlupacity.gov.ph/barangays/brgy-tunasan/); street address, current counter, and pin need reconciliation. |
| `barangay-poblacion-office` | Barangay Poblacion Office | Poblacion | [City barangay profile](https://muntinlupacity.gov.ph/barangays/brgy-poblacion/); street address, current counter, and pin need reconciliation. |
| `city-health-office-tunasan` | City Health Office | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/city-health-office/); Centennial Avenue office, distinct from health-center records. |
| `city-bplo-tunasan` | Business Permits and Licensing Office | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/business-permits-and-licensing-office/); sports-complex address is explicitly temporary. |
| `city-esc-tunasan` | Environmental Sanitation Center | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/environmental-sanitation-center/); Arandia Street, entrance and pin unknown. |
| `city-eced-tunasan` | Early Childhood Education Division | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/early-childhood-education-division/); administrative office in Laguerta Bulilit Center; individual centers are a coverage gap. |
| `city-security-office-tunasan` | City Security Office | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/city-security-office/); Motorpool Building, Pacwood Site. |
| `city-ddrm-tunasan` | Department of Disaster Resilience and Management | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/muntinlupa-city-department-of-disaster-resilience-and-management/); Resilience Building, Hall of Justice Compound. |
| `city-museo-tunasan` | Museo ng Muntinlupa | Tunasan | [City museum page](https://muntinlupacity.gov.ph/departments-offices/museo-ng-muntinlupa/); public cultural venue, schedule and entrance unknown. |
| `city-yasdo-tunasan` | Youth Affairs and Sports Development Office | Tunasan | [City office page](https://muntinlupacity.gov.ph/departments-offices/youth-affairs-and-sports-development-office-yasdo/); head office only; Alabang satellite excluded. |
| `city-public-library-poblacion` | Muntinlupa City Public Library | Poblacion | [City library page](https://muntinlupacity.gov.ph/departments-offices/muntinlupa-city-public-library/); current address block used; historical Contessa Building narrative is not treated as another branch. Bayanan extension excluded. |
| `city-scholarship-poblacion` | Muntinlupa Scholarship Division | Poblacion | [City office page](https://muntinlupacity.gov.ph/departments-offices/muntinlupa-scholarship-division/); Plaza Central office. |
| `city-leipo-poblacion` | Local Economic and Investment Promotion Office | Poblacion | [City office page](https://muntinlupacity.gov.ph/departments-offices/local-economic-and-investment-promotion-office-leipo/); Plaza Central office. |
| `city-poso-poblacion` | Public Order and Safety Office | Poblacion | [City office page](https://muntinlupacity.gov.ph/departments-offices/public-order-and-safety-office-poso/); Plaza Central office. |
| `deped-sdo-muntinlupa` | DepEd Schools Division Office Muntinlupa | Poblacion | [DepEd division directory](https://www.deped.gov.ph/contact-us/regional-division-offices-directory/); public agency office at Laguerta Street, Tensuan Site. |

## Included public health centers

The [DOH NTP Tunasan record](https://ntp.doh.gov.ph/view-facility/?id=13140) and [DOH health-center results](https://ntp.doh.gov.ph/resources/facilities/?FacilitySearch%5Btype_id%5D=5&yiiwp-page=104) were reviewed on **2026-10-27**. They support facility identity, type, barangay, and address. Clinic services, hours, phone numbers, entrance details, and pins are not imported from assumptions about a health-center type.

| Stable key | Listing | Barangay | Published address lead |
| --- | --- | --- | --- |
| `doh-tunasan-health-center` | Tunasan Health Center | Tunasan | E. Rodriguez Avenue, beside barangay hall. |
| `doh-poblacion-health-center` | Poblacion Health Center | Poblacion | Ground Floor, Contessa Building, Rizal Street. |
| `doh-southville-health-center` | Southville Health Center | Poblacion | Phase 1, Insular Prison Road, South Ville 3. |

Poblacion and Southville are distinct physical clinic locations. DOTS/iDOTS program rows referring to the same clinic were not duplicated. The NTP directory is not a complete inventory of every public clinic or health station.

## Included public education sites

School identity checks use the [current DepEd dashboard](https://nid.deped.gov.ph/public-dashboard/region/NCR/division/Muntinlupa%20City), updated 2026-10-18 and reviewed **2026-10-27**. Address-source periods remain visible below and in JSON. School IDs form stable import keys, avoiding duplicates caused by abbreviation changes.

| Stable key | Listing | Barangay | Address/location evidence |
| --- | --- | --- | --- |
| `deped-136903` | Muntinlupa Elementary School | Poblacion | [SY 2020-2021 masterlist](https://www.deped.gov.ph/wp-content/uploads/2021/06/SY-2020-2021-Masterlist-of-Schools-Address-only-1-1.pdf), Rizal Street; [2026 PPP list](https://www.deped.gov.ph/wp-content/uploads/Deped-Announcement-on-PPP-Indicative-List-of-Schools-Annex-A-2025-12-08_1.pdf), coordinates 14.3891958, 121.0442405. |
| `deped-136906` | Tunasan Elementary School | Tunasan | [SY 2020-2021 masterlist](https://www.deped.gov.ph/wp-content/uploads/2021/06/SY-2020-2021-Masterlist-of-Schools-Address-only-1-1.pdf), Arandia Street; [2026 PPP list](https://www.deped.gov.ph/wp-content/uploads/Deped-Announcement-on-PPP-Indicative-List-of-Schools-Annex-A-2025-12-08_1.pdf), coordinates 14.3811, 121.0516. |
| `deped-136907` | Victoria Homes Elementary School | Tunasan | [SY 2020-2021 masterlist](https://www.deped.gov.ph/wp-content/uploads/2021/06/SY-2020-2021-Masterlist-of-Schools-Address-only-1-1.pdf), Don Pedro Reyes Avenue, Victoria Homes Subdivision. |
| `deped-228501` | Poblacion Elementary School | Poblacion | [SY 2020-2021 masterlist](https://www.deped.gov.ph/wp-content/uploads/2021/06/SY-2020-2021-Masterlist-of-Schools-Address-only-1-1.pdf), Phase 1 Southville 3. |
| `deped-305468` | Muntinlupa National High School | Poblacion | [2026 allocation list](https://www.deped.gov.ph/wp-content/uploads/Annex-B_Allocation-List_2026-B1-CB-007.pdf), NBP Reservation. |
| `deped-305469` | Muntinlupa Science High School | Tunasan | [2026 allocation list](https://www.deped.gov.ph/wp-content/uploads/Annex-B_Allocation-List_2026-B1-CB-007.pdf), Arandia Street. |
| `deped-320701` | Poblacion National High School | Poblacion | [2026 allocation list](https://www.deped.gov.ph/wp-content/uploads/Annex-B_Allocation-List_2026-B1-CB-007.pdf), Southville 3, NHA. |
| `city-mcti-southville-annex` | Muntinlupa City Technical Institute - Southville Annex | Poblacion | [City institute page](https://muntinlupacity.gov.ph/departments-offices/muntinlupa-city-technical-institute/), Phase 2 Block 3 Lot 1, Southville III. Main Putatan campus excluded; shared institute phones and annex-specific course availability need confirmation. |
| `plmun-poblacion` | Pamantasan ng Lungsod ng Muntinlupa | Poblacion | [City university page](https://muntinlupacity.gov.ph/departments-offices/pamantasan-ng-lungsod-ng-muntinlupa-plmun/), University Road, NBP Reservation. |

All sources in this table were reviewed **2026-10-27**. DepEd coordinates establish an official map point only; no entrance, accessible route, or site visit is claimed.

## Reconciliation queue and exclusions

| Lead or gap | Current disposition | Evidence needed |
| --- | --- | --- |
| Every public-facing government counter and national-agency service point | Coverage incomplete. The [city departments index](https://muntinlupacity.gov.ph/departments-offices/) and [GIS catalogue](https://cgis.muntinlupacity.gov.ph/catalogue/) are leads, not an exhaustive reconciled inventory. | Barangay and facility-owner reconciliation of current addresses, visitor access, shared counters, relocations, and missing national-agency locations. |
| Public child-development centers and other government learning centers | Not enumerated. ECED's official role does not establish a current center list. | Current public-center roster with physical addresses and ownership. |
| Other public health centers/stations | Not assumed absent. NTP program records may omit facilities. | City Health Office/barangay roster and current facility-owner confirmation. |
| Tunasan National HS, school 320704 | Deferred. The current dashboard confirms identity; the 2026 allocation address, Old PNB Bldg., National Road, omits barangay. | Explicit current physical barangay; the school's name is insufficient. |
| Itaas ES, school 136901 | Deferred. Current dashboard confirms identity, but a reliable current pilot-boundary address is unresolved. | Current official address and barangay. |
| Old Muntinlupa NHS-Tunasan Annex name | No duplicate record created. | Reconcile historical name/ID with current school 320704. |
| Colegio de Muntinlupa | Excluded; [city college page](https://muntinlupacity.gov.ph/departments-offices/colegio-de-muntinlupa/) locates it in Sucat. | Reconsider only if a separate public site in the pilot is confirmed. |
| Library Bayanan extension, YASDO Alabang satellite, MCTI Putatan main campus | Excluded as outside the pilot. | No action for this two-barangay pilot. |
| Private schools/clinics and internal offices without public visitors | Excluded by scope. | No action unless public ownership and public-facing operation are established. |

Keep the user-facing coverage wording **“pilot listings in progress”** until both barangays and relevant facility owners reconcile this queue. No outreach or owner confirmation has been performed by the application build.

## Import and maintenance

Run `node --test scripts/import-pilot-places.test.mjs` to validate behavior and the committed JSON without credentials. To import, set **only** `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the local process environment, then run:

```text
node scripts/import-pilot-places.mjs --input data/pilot-places.json
```

Use a local Supabase instance with the committed migration applied. Do not put a privileged key in the JSON, browser variables, or a command argument. The script reads no environment file, and `.env.local` is already ignored by the repository's `*.local` rule. It prints counts or a generic database-stage error, never database error payloads or credentials.

Validation checks the entire file before the first database request. It rejects unsupported fields, unsupported pilot barangays/categories, duplicate keys, malformed coordinates/access/source dates, missing evidence, and OSM evidence for fields other than location. It accepts explicit nulls and unknown access values.

After validation, a read preflight refuses places whose verification state has advanced beyond `awaiting_review`, protecting moderated or field-checked records. Places upsert on `source_key`; source rows use deterministic UUID v5 identities based on place key, field, source type, source URL, and source name. `checkedAt` is excluded from source identity so rechecks update a source row instead of duplicating it. Place IDs remain database-owned. Import stages records as drafts, writes evidence, then publishes. A failed source or publication step leaves staged records unpublished; fix the cause and rerun the same inventory. The preflight and write stages are not one database transaction; run baseline imports while moderation is inactive.

This is a reviewed baseline importer. Reimports overwrite the imported public fields of eligible baseline keys and do not delete historical/manual sources or places omitted from the file. The importer refuses previously moderated or field-checked records; it is not an automatic freshness or removal workflow. A real local Supabase import and second-run duplicate check remain an open verification gate when the local runtime is unavailable. HTTP-boundary tests verify stable IDs and ordering, not PostgreSQL constraints or RLS.
