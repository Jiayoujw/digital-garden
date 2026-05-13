import type { ReactNode } from 'react';

export interface NoteTemplate {
  id: string;
  name: string;
  nameZh: string;
  icon: ReactNode;
  frontmatter: { tags: string[] };
  content: string;
}

import { FileText, Users, BookOpen, ClipboardList, Lightbulb, Rocket } from 'lucide-react';

const ic = (Icon: typeof FileText) => <Icon size={14} />;

export const templates: NoteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    nameZh: '空白',
    icon: ic(FileText),
    frontmatter: { tags: [] },
    content: '',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    nameZh: '会议纪要',
    icon: ic(Users),
    frontmatter: { tags: ['meeting'] },
    content: `## Attendees\n\n- \n\n## Agenda\n\n1. \n\n## Discussion\n\n`,
  },
  {
    id: 'book-review',
    name: 'Book Review',
    nameZh: '读书笔记',
    icon: ic(BookOpen),
    frontmatter: { tags: ['book-review'] },
    content: `## Metadata\n\n- Author: \n- Year: \n- Rating: /5\n\n## Summary\n\n\n## Key Takeaways\n\n- \n- \n- \n\n## Quotes\n\n> \n\n`,
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    nameZh: '周报',
    icon: ic(ClipboardList),
    frontmatter: { tags: ['weekly-review'] },
    content: `## Wins\n\n- \n\n## Challenges\n\n- \n\n## Learnings\n\n- \n\n## Next Week\n\n- [ ] \n`,
  },
  {
    id: 'idea',
    name: 'Idea Dump',
    nameZh: '想法记录',
    icon: ic(Lightbulb),
    frontmatter: { tags: ['idea'] },
    content: `## Context\n\n\n## Core Idea\n\n\n## Related Notes\n\n`,
  },
  {
    id: 'project',
    name: 'Project Note',
    nameZh: '项目笔记',
    icon: ic(Rocket),
    frontmatter: { tags: ['project'] },
    content: `## Goal\n\n\n## Milestones\n\n- [ ] \n\n## Resources\n\n- \n\n## Notes\n\n`,
  },
];
