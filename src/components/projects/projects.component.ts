
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface Project {
  name: string;
  subtitle?: string;
  description: string;
  emoji: string;
  tags: string[];
  featured?: boolean;
  impact: string;
  githubLink: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  projects = signal<Project[]>([
    {
      name: 'SOC Log Analysis Lab',
      subtitle: 'SIEM Investigation Environment',
      description: 'Built a complete SOC analyst lab environment using Splunk and custom log ingestion pipelines. Analyzed Windows Event Logs, Sysmon data, and firewall logs to detect brute-force attacks, lateral movement, and data exfiltration patterns.',
      emoji: '\ud83d\udd0d',
      tags: ['Splunk', 'SIEM', 'Windows Event Logs', 'Sysmon', 'Incident Response'],
      featured: true,
      impact: 'Detected 15+ attack patterns across simulated enterprise network traffic',
      githubLink: '#'
    },
    {
      name: 'Phishing Email Detection',
      subtitle: 'Email Security Analysis',
      description: 'Developed a phishing email detection simulation that analyzes email headers, URLs, attachments, and social engineering indicators. Built classification rules to categorize emails as legitimate, suspicious, or malicious.',
      emoji: '\ud83c\udfa3',
      tags: ['Python', 'Email Analysis', 'Threat Intelligence', 'Social Engineering'],
      featured: false,
      impact: 'Achieved 94% accuracy in identifying phishing attempts across 500+ test emails',
      githubLink: '#'
    },
    {
      name: 'Network Traffic Analyzer',
      subtitle: 'Packet Analysis Tool',
      description: 'Created a network traffic analysis project using Wireshark and tcpdump to capture, filter, and analyze network packets. Identified suspicious connections, DNS tunneling attempts, and unauthorized data transfers.',
      emoji: '\ud83d\udce1',
      tags: ['Wireshark', 'tcpdump', 'Network Security', 'Packet Analysis', 'DNS'],
      featured: false,
      impact: 'Identified 8 types of network-based attacks in simulated traffic captures',
      githubLink: '#'
    },
    {
      name: 'AI Threat Report Generator',
      subtitle: 'Automated Security Intelligence',
      description: 'Built an AI-assisted tool that automatically generates structured threat intelligence reports from raw security logs and alerts. Uses NLP to summarize incidents, extract IOCs, and suggest remediation steps.',
      emoji: '\ud83e\udd16',
      tags: ['Python', 'AI/ML', 'NLP', 'Threat Intelligence', 'Automation'],
      featured: false,
      impact: 'Reduced manual report generation time by 70% with automated IOC extraction',
      githubLink: '#'
    }
  ]);
}
