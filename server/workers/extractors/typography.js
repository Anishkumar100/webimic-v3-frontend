export const extractTypography = async (pages) => {
  console.log('[ExtractTypography] Start:', { pageCount: pages.length });
  const allStyles = pages.flatMap((p) => p.rawStyles || []);
  console.log('[ExtractTypography] Raw style rows:', allStyles.length);
  const typographyMap = new Map(); // key = "tag:fontFamily:fontSize:fontWeight"

  for (const style of allStyles) {
    if (!style.fontFamily || !style.fontSize) continue;
    if (['div', 'span', 'a'].includes(style.tag) && parseFloat(style.fontSize) < 12) continue; // Skip tiny spans

    const familyClean = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    const key = `${style.tag}:${familyClean}:${style.fontSize}:${style.fontWeight}`;

    if (!typographyMap.has(key)) {
      typographyMap.set(key, {
        tag: style.tag,
        fontFamily: style.fontFamily,
        fontFamilyClean: familyClean,
        fontSize: style.fontSize,
        fontWeight: parseInt(style.fontWeight) || 400,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing !== 'normal' ? style.letterSpacing : '0em',
        textTransform: style.textTransform !== 'none' ? style.textTransform : 'none',
        sampleText: style.textContent || 'Sample text',
        count: 0,
      });
    }
    typographyMap.get(key).count++;
  }

  // Convert to array, sort by heading hierarchy then frequency
  const HEADING_ORDER = { h1: 0, h2: 1, h3: 2, h4: 3, h5: 4, h6: 5, p: 6, code: 7, label: 8 };
  const result = Array.from(typographyMap.values())
    .sort((a, b) => {
      const aOrder = HEADING_ORDER[a.tag] ?? 99;
      const bOrder = HEADING_ORDER[b.tag] ?? 99;
      return aOrder - bOrder || b.count - a.count;
    })
    .slice(0, 20); // Cap at 20 unique type styles
  console.log('[ExtractTypography] Complete:', { uniqueStyles: result.length });
  return result;
};
