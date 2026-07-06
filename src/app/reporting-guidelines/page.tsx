import Link from "next/link";
import styles from "./reporting-guidelines.module.css";

export const metadata = {
  title: "Accident Reporting Guidelines | NSIB",
  description:
    "Guidelines for reporting transportation occurrences (aviation, marine, rail and other modes) to the Nigerian Safety Investigation Bureau (NSIB).",
};

export default function ReportingGuidelinesPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.floatingElement} />
        <div className={styles.floatingElementSlow} />

        <div className={styles.heroInner}>
          <Link
            href="/operations-centre"
            style={{
              display: "inline-block",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "1.5rem",
              textDecoration: "none",
            }}
          >
            ← Back to Operations Centre
          </Link>
          <p className={styles.heroLabel}>Official Protocol</p>
          <h1 className={styles.heroTitle}>
            Accident <em>Reporting</em>
            <br />
            Guidelines
          </h1>
          <p className={styles.heroSubtitle}>
            Guidelines for reporting transportation occurrences. Please follow
            the steps below when reporting accidents and incidents to the Bureau.
          </p>
        </div>
      </section>

      {/* ── Emergency Banner ── */}
      <div className={styles.emergencyBanner}>
        <div className={styles.emergencyBannerInner}>
          <div className={styles.emergencyLeft}>
            <span className={styles.emergencyIcon}>📞</span>
            <span className={styles.emergencyText}>
              NSIB emergency lines — report all reportable occurrences without
              delay
            </span>
          </div>
          <span className={styles.emergencyNumber}>+234 807 709 0908 / +234 807 709 0909</span>
        </div>
      </div>

      {/* ── Body ── */}
      <section className={styles.body}>
        <div className={styles.bodyInner}>
          {/* 1–3: Scope & Responsibility */}
          <div className={styles.legalCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              <h2 className={styles.sectionTitle}>Scope &amp; Responsibility</h2>
            </div>
            <p className={styles.lead}>
              All reportable occurrences must be promptly notified to the Nigerian
              Safety Investigation Bureau (NSIB). These guidelines apply to
              occurrences involving civil aviation; marine and inland waterways
              transportation; railway and tracked vehicles; and any other means of
              transportation.
            </p>

            <p style={{ fontWeight: 700, color: "var(--nsib-navy)", marginBottom: "0.75rem" }}>
              Who should report
            </p>
            <p className={styles.lead} style={{ marginBottom: "1rem" }}>
              Any person or organization having knowledge of a reportable
              occurrence shall notify the Bureau without delay. The legal
              responsibility for notifying the Bureau of a reportable occurrence
              rests initially with the following:
            </p>

            <ol className={`${styles.legalList} ${styles.lvlAlpha}`}>
              <li>
                <span className={styles.subhead}>
                  In the case of an aircraft reportable occurrence:
                </span>
                <ol className={styles.lvlRoman}>
                  <li>
                    The Pilot-in-Command of the aircraft involved. If the
                    Pilot-in-Command is fatally injured or incapacitated, the
                    operator, owner or hirer assumes this responsibility;
                  </li>
                  <li>
                    If the reportable occurrence happens on or adjacent to an
                    aerodrome, the aerodrome authority is also obligated to notify
                    the Bureau;
                  </li>
                  <li>Maintenance organization; and</li>
                  <li>Any other person designated by law.</li>
                </ol>
              </li>
              <li>
                <span className={styles.subhead}>
                  In the case of a marine or inland waterways occurrence:
                </span>
                <ol className={styles.lvlRoman}>
                  <li>
                    The vessel master or, if the vessel master has not survived,
                    the senior surviving officer or any crew member of the vessel;
                  </li>
                  <li>
                    The operator, owner, charterer, or agent of the ship or vessel,
                    unless they have ascertained that the vessel master or senior
                    surviving officer has reported the occurrence;
                  </li>
                  <li>A pilot who has duties on board the vessel;</li>
                  <li>
                    The pilotage service provider responsible for assigning or
                    allocating a pilot to the vessel;
                  </li>
                  <li>
                    The vessel traffic authority that provides a vessel traffic
                    service to the vessel;
                  </li>
                  <li>The Harbour Master;</li>
                  <li>The Boat Master;</li>
                  <li>Port, Terminal or Jetty authorities/operators;</li>
                  <li>
                    The Regulator of the territorial waters, if a foreign ship is
                    involved, or the regulator of the inland waterways.
                  </li>
                </ol>
              </li>
              <li>
                <span className={styles.subhead}>
                  In the case of a railway and tracked vehicle occurrence:
                </span>
                <ol className={styles.lvlRoman}>
                  <li>
                    The Driver or, if the driver has not survived, the senior
                    surviving staff or any crew member of the train or tracked
                    vehicle;
                  </li>
                  <li>
                    The operator or railway industry body whose property or staff
                    have been involved in the occurrence on railway property.
                  </li>
                </ol>
              </li>
              <li>
                <span className={styles.subhead}>
                  In the case of any other means of transportation:
                </span>
                <ol className={styles.lvlRoman}>
                  <li>
                    The Driver, operator or any other person exercising authority
                    over that means of transportation;
                  </li>
                  <li>
                    Safety regulatory authority, security agencies, infrastructure
                    manager or any other person designated by law.
                  </li>
                </ol>
              </li>
            </ol>
          </div>

          {/* 4: What to Report */}
          <div className={styles.legalCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              <h2 className={styles.sectionTitle}>What to Report</h2>
            </div>
            <p className={styles.lead}>The following are reportable occurrences:</p>

            <ol className={`${styles.legalList} ${styles.lvlAlpha}`}>
              <li>
                <span className={styles.subhead}>Aviation Occurrences</span> — the
                following shall be immediately reportable:
                <ol className={styles.lvlRoman}>
                  <li>Aircraft accidents;</li>
                  <li>Serious incidents;</li>
                  <li>Runway incursions involving collision risk;</li>
                  <li>Loss of separation;</li>
                  <li>Controlled flight into terrain (CFIT);</li>
                  <li>Fire, smoke, or explosion;</li>
                  <li>Structural or engine failure affecting safety;</li>
                  <li>Dangerous goods occurrences;</li>
                  <li>Bird strike causing substantial damage;</li>
                  <li>
                    Fatal or serious injury associated with aircraft operations;
                  </li>
                  <li>Unlawful interference.</li>
                </ol>
              </li>
              <li>
                <span className={styles.subhead}>
                  Marine and Inland Waterways Occurrences
                </span>
                <ol className={styles.lvlRoman}>
                  <li>A person is killed or sustains serious injury;</li>
                  <li>
                    A crew member whose duties are directly related to the safe
                    operation of the ship is unable to perform their duties as a
                    result of a physical incapacitation which poses a threat to the
                    safety of persons, property or the environment;
                  </li>
                  <li>Vessel sinking, foundering or capsizing;</li>
                  <li>Vessel collision or a risk of a collision;</li>
                  <li>Vessel fire or an explosion;</li>
                  <li>Vessel aground;</li>
                  <li>
                    Vessel unforeseen contact with the bottom without going
                    aground;
                  </li>
                  <li>
                    Vessel damage that affects its seaworthiness or renders it
                    unfit for its purpose;
                  </li>
                  <li>
                    Vessel anchored, grounded or beached to avoid an occurrence;
                  </li>
                  <li>Vessel missing or abandoned;</li>
                  <li>Fouls a utility cable or pipe, or an underwater pipeline;</li>
                  <li>
                    Total failure of:
                    <ol className={styles.lvlUpper}>
                      <li>
                        the navigation equipment, if the failure poses a threat to
                        the safety of any person, property or the environment;
                      </li>
                      <li>the main or auxiliary machinery; or</li>
                      <li>
                        the propulsion, steering, or deck machinery, if the failure
                        poses a threat to the safety of any person, property or the
                        environment;
                      </li>
                    </ol>
                  </li>
                  <li>All or part of the ship’s cargo shifts or falls overboard; or</li>
                  <li>
                    There is an accidental release on board or from the ship which
                    results in any of the events relating to Transportation of
                    Dangerous Goods.
                  </li>
                </ol>
              </li>
              <li>
                <span className={styles.subhead}>
                  Railway and Tracked Vehicle Occurrences
                </span>
                <ol className={styles.lvlRoman}>
                  <li>A person is killed or sustains serious injury;</li>
                  <li>Train collisions;</li>
                  <li>Derailments;</li>
                  <li>Signal Passed at Danger (SPAD) with safety consequence;</li>
                  <li>Level crossing collisions;</li>
                  <li>Infrastructure failure;</li>
                  <li>Fire or explosion;</li>
                  <li>Hazardous materials release.</li>
                </ol>
              </li>
              <li>
                <span className={styles.subhead}>Any other transportation</span>
                <ol className={styles.lvlRoman}>
                  <li>
                    <span className={styles.subhead}>Road Occurrences:</span>
                    <ol className={styles.lvlUpper}>
                      <li>Fatal crashes involving public transport;</li>
                      <li>Mass casualty events;</li>
                      <li>Hazardous goods vehicle crashes;</li>
                      <li>Commercial vehicle fire/explosion;</li>
                      <li>
                        Infrastructure collapse affecting public transport safety.
                      </li>
                    </ol>
                  </li>
                  <li>
                    <span className={styles.subhead}>
                      Pipeline and Energy Transport Occurrences:
                    </span>
                    <ol className={styles.lvlUpper}>
                      <li>A person is killed or sustains a serious injury;</li>
                      <li>Explosion;</li>
                      <li>Fire;</li>
                      <li>Product leakage;</li>
                      <li>Structural rupture;</li>
                      <li>Environmental contamination.</li>
                    </ol>
                  </li>
                </ol>
              </li>
            </ol>
          </div>

          {/* 5–6: How to Notify */}
          <div className={styles.legalCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              <h2 className={styles.sectionTitle}>Method of Notification</h2>
            </div>
            <p className={styles.lead}>
              Initial notification may be made verbally through any of the
              channels below, but shall be followed by a completed NSIB
              notification form.
            </p>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Emergency Mobile</span>
                <span className={styles.contactValue}>+234 807 709 0908</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Emergency Mobile</span>
                <span className={styles.contactValue}>+234 807 709 0909</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Official Email</span>
                <span className={styles.contactValue}>dg@nsib.gov.ng</span>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Official Email</span>
                <span className={styles.contactValue}>info@nsib.gov.ng</span>
              </div>
            </div>
            <p className={styles.lead} style={{ marginTop: "1.25rem", marginBottom: 0 }}>
              Notification may also be made through the{" "}
              <Link href="/reporting" style={{ color: "var(--nsib-red)", fontWeight: 600 }}>
                NSIB website
              </Link>
              .
            </p>
          </div>

          {/* Minimum information */}
          <div className={styles.legalCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionAccent} />
              <h2 className={styles.sectionTitle}>Minimum Information Required</h2>
            </div>
            <p className={styles.lead}>
              Every notification shall contain, where available, the following
              information:
            </p>
            <ol className={`${styles.legalList} ${styles.lvlAlpha}`}>
              <li>Name of operator/owner or hirer, if applicable;</li>
              <li>
                Identification / registration marks of vessel / aircraft / train /
                vehicle;
              </li>
              <li>Nationality of aircraft / vessel / train / vehicle;</li>
              <li>Last point of departure;</li>
              <li>Location of occurrence;</li>
              <li>Date and time;</li>
              <li>Nature of occurrence;</li>
              <li>Number of persons on board;</li>
              <li>Casualties;</li>
              <li>Damage sustained;</li>
              <li>Hazardous materials involved;</li>
              <li>Immediate actions taken;</li>
              <li>Name and contact of reporting person.</li>
            </ol>
            <p className={styles.closing} style={{ marginTop: "1.75rem" }}>
              These guidelines ensure timely and accurate reporting of accidents,
              facilitating efficient investigation and safety enhancement measures
              by the NSIB.
            </p>
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            <div className={styles.ctaText}>
              <h3>Ready to file a report?</h3>
              <p>
                Use our secure Online Reporting Portal to submit your
                notification.
              </p>
            </div>
            <Link href="/reporting" className={styles.ctaBtn}>
              Go to Reporting Portal
              <span className={styles.ctaArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
