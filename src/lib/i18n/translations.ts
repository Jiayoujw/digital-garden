export type Locale = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Sidebar
    home: 'Home',
    graph: 'Graph',
    daily: 'Daily',
    clusters: 'Clusters',
    digital_garden: '🌱 Digital Garden',
    search_notes: 'Search notes...',
    new_note: '+ New Note',
    recent_notes: 'Recent Notes',
    no_notes_yet: 'No notes yet. Create one!',
    note_title_prompt: 'Note title',
    create_note: 'Create Note',
    cancel: 'Cancel',

    // SearchBar
    search_your_garden: 'Search your garden...',

    // Home page
    my_digital_garden: 'My Digital Garden',
    garden_subtitle: 'A non-linear space for growing ideas. Write notes, link them with [[wikilinks]], and watch your knowledge graph emerge.',
    notes: 'Notes',
    connections: 'Connections',
    todays_note: "Today's Note →",
    your_garden_empty: 'Your garden is empty',
    garden_empty_desc: 'Create your first note to start growing your knowledge graph',
    create_first_note: 'Create First Note',

    // Note page
    edit: 'Edit',
    preview: 'Preview',
    split: 'Split',
    note_not_found: 'Note not found',
    note_not_found_desc: 'The note "{slug}" doesn\'t exist yet.',
    go_home: 'Go Home',

    // Note editor
    note_title_placeholder: 'Note title',
    saving: 'Saving...',
    saved: 'Saved',
    tags_placeholder: 'Tags: comma, separated',
    start_writing: 'Start writing... Use [[wikilinks]] to connect notes',
    type_to_search: 'Type to search notes...',

    // Backlinks panel
    links_to: 'Links to',
    linked_from: 'Linked from',

    // Daily page
    daily_notes: 'Daily Notes',
    prev: '← Prev',
    today: 'Today',
    next: 'Next →',
    whats_on_mind: "What's on your mind today?",
    auto_saves: 'Auto-saves on blur',
    all_daily_notes: 'All daily notes →',

    // Graph page
    no_graph_data: 'No graph data yet',
    no_graph_data_desc: 'Create notes with [[wikilinks]] to see your knowledge graph',

    // Clusters page
    topic_clusters: 'Topic Clusters',
    clusters_desc: 'Notes automatically grouped by similarity of their connections',
    no_clusters_yet: 'No clusters yet',
    no_clusters_desc: 'Add more notes and links to see topic clusters emerge',
    note_singular: 'note',
    note_plural: 'notes',
    more_suffix: '+{n} more',

    // Search page
    search: 'Search',
    search_colon: 'Search: "{q}"',
    searching: 'Searching...',
    result: 'result',
    results: 'results',
    search_your_notes: 'Search your notes',
    search_your_notes_hint: 'Use the search bar to find notes by title, content, or tags',
    no_notes_found: 'No notes found',
    try_different_keywords: 'Try different keywords',
    match_percent: '{p}% match',
    no_content: 'No content',

    // Metadata
    html_title: 'Digital Garden',
    html_description: 'Personal knowledge graph & second brain',
  },

  zh: {
    // Sidebar
    home: '首页',
    graph: '图谱',
    daily: '日记',
    clusters: '聚类',
    digital_garden: '🌱 数字花园',
    search_notes: '搜索笔记...',
    new_note: '+ 新建笔记',
    recent_notes: '最近笔记',
    no_notes_yet: '暂无笔记，创建一个吧！',
    note_title_prompt: '笔记标题',
    create_note: '创建笔记',
    cancel: '取消',

    // SearchBar
    search_your_garden: '搜索你的花园...',

    // Home page
    my_digital_garden: '我的数字花园',
    garden_subtitle: '一个非线性的思想生长空间。用 [[wikilinks]] 连接笔记，看着你的知识图谱自然生长。',
    notes: '笔记',
    connections: '连接',
    todays_note: '今日日记 →',
    your_garden_empty: '你的花园还是空的',
    garden_empty_desc: '创建第一篇笔记，开始构建你的知识图谱',
    create_first_note: '创建第一篇笔记',

    // Note page
    edit: '编辑',
    preview: '预览',
    split: '分屏',
    note_not_found: '笔记未找到',
    note_not_found_desc: '笔记 "{slug}" 还不存在。',
    go_home: '返回首页',

    // Note editor
    note_title_placeholder: '笔记标题',
    saving: '保存中...',
    saved: '已保存',
    tags_placeholder: '标签：逗号分隔',
    start_writing: '开始写作... 使用 [[wikilinks]] 连接笔记',
    type_to_search: '输入以搜索笔记...',

    // Backlinks panel
    links_to: '链接到',
    linked_from: '被以下笔记引用',

    // Daily page
    daily_notes: '每日日记',
    prev: '← 前一天',
    today: '今天',
    next: '后一天 →',
    whats_on_mind: '今天在想什么？',
    auto_saves: '失焦自动保存',
    all_daily_notes: '所有日记 →',

    // Graph page
    no_graph_data: '暂无图谱数据',
    no_graph_data_desc: '创建包含 [[wikilinks]] 的笔记来生成知识图谱',

    // Clusters page
    topic_clusters: '主题聚类',
    clusters_desc: '根据笔记之间的连接相似度自动分组',
    no_clusters_yet: '暂无聚类',
    no_clusters_desc: '添加更多笔记和链接，主题聚类将自然浮现',
    note_singular: '篇笔记',
    note_plural: '篇笔记',
    more_suffix: '+{n} 更多',

    // Search page
    search: '搜索',
    search_colon: '搜索："{q}"',
    searching: '搜索中...',
    result: '个结果',
    results: '个结果',
    search_your_notes: '搜索你的笔记',
    search_your_notes_hint: '使用搜索栏按标题、内容或标签查找笔记',
    no_notes_found: '未找到笔记',
    try_different_keywords: '试试其他关键词',
    match_percent: '{p}% 匹配',
    no_content: '暂无内容',

    // Metadata
    html_title: '数字花园',
    html_description: '个人知识图谱与第二大脑',
  },
} as const;
