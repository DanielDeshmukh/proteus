"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AtsResume } from "@/lib/resume-ats";
import { bulletText, entryHead, splitParagraphs } from "@/lib/resume-ats";

// ATS-safe layout: single column, 0.75in margins, system font, text-based
// output, no headers/footers/tables/columns/images.
const NAME_SIZE = 20;
const HEADING_SIZE = 13;
const BODY_SIZE = 10.5;

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingLeft: 54,
    paddingRight: 54,
    fontFamily: "Helvetica",
    fontSize: BODY_SIZE,
    lineHeight: 1.45,
    color: "#333333",
  },
  name: {
    fontSize: NAME_SIZE,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 8,
  },
  heading: {
    fontSize: HEADING_SIZE,
    fontWeight: "bold",
    color: "#1F3864",
    marginTop: 14,
    marginBottom: 6,
  },
  entryHead: {
    fontSize: BODY_SIZE,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 6,
  },
  entryDates: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#333333",
    marginBottom: 2,
  },
  body: {
    fontSize: BODY_SIZE,
    color: "#333333",
    marginBottom: 3,
  },
  paragraph: {
    fontSize: BODY_SIZE,
    color: "#333333",
    marginBottom: 6,
  },
});

export function ResumePDF({ ats }: { ats: AtsResume }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {ats.name ? <Text style={styles.name}>{ats.name}</Text> : null}
        {ats.contact.length ? <Text style={styles.contact}>{ats.contact.join(" | ")}</Text> : null}

        {ats.sections.map((section, si) => (
          <View key={si} wrap>
            {section.heading ? <Text style={styles.heading}>{section.heading}</Text> : null}

            {section.entries
              ? section.entries.map((entry, ei) => (
                  <View key={ei} wrap>
                    {entryHead(entry) ? <Text style={styles.entryHead}>{entryHead(entry)}</Text> : null}
                    {entry.dates ? <Text style={styles.entryDates}>{entry.dates}</Text> : null}
                    {entry.body.map((line, li) => (
                      <Text key={li} style={styles.body}>
                        {bulletText(line)}
                      </Text>
                    ))}
                  </View>
                ))
              : splitParagraphs(section.lines).map((para, pi) => (
                  <Text key={pi} style={styles.paragraph}>
                    {para}
                  </Text>
                ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
