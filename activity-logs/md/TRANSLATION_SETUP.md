# Translation Setup Guide

This guide explains how to set up auto-translation for all content in the SLxAI portal.

## Current Implementation

### 1. **Static UI Translations** (Already Working)
- Menu items, buttons, labels are translated using JSON files in `src/locales/`
- Use `const { t } = useLanguage()` and `t('common.globalFeed')` for static text

### 2. **Dynamic Content Translation** (Requires API Setup)
- Posts, comments, and user-generated content can be auto-translated using an API
- Use `const { translate } = useLanguage()` and `await translate(text)` for dynamic content

## Setup Options

### Option 1: Google Translate API (Recommended)

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Cloud Translation API"
   - Create credentials (API Key)

2. **Update Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_TRANSLATION_API_URL=https://translation.googleapis.com/language/translate/v2
   VITE_TRANSLATION_API_KEY=your-api-key-here
   ```

3. **Update `src/lib/translation.ts`:**
   Replace the `translateText` function with Google Translate implementation:
   ```typescript
   const response = await fetch(`${TRANSLATION_API_URL}?key=${TRANSLATION_API_KEY}`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       q: text,
       source: LANGUAGE_CODE_MAP[sourceLanguage],
       target: LANGUAGE_CODE_MAP[targetLanguage],
       format: 'text',
     }),
   });
   ```

### Option 2: DeepL API (Better Quality)

1. **Get API Key:**
   - Sign up at [DeepL API](https://www.deepl.com/pro-api)
   - Get your API key

2. **Update Environment Variables:**
   ```env
   VITE_TRANSLATION_API_URL=https://api-free.deepl.com/v2/translate
   VITE_TRANSLATION_API_KEY=your-deepl-api-key
   ```

3. **Update `src/lib/translation.ts`:**
   ```typescript
   const response = await fetch(TRANSLATION_API_URL, {
     method: 'POST',
     headers: {
       'Authorization': `DeepL-Auth-Key ${TRANSLATION_API_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       text: [text],
       source_lang: LANGUAGE_CODE_MAP[sourceLanguage].toUpperCase(),
       target_lang: LANGUAGE_CODE_MAP[targetLanguage].toUpperCase(),
     }),
   });
   ```

### Option 3: Free Alternative (MyMemory API)

1. **No API Key Required** (but has rate limits)

2. **Update `src/lib/translation.ts`:**
   ```typescript
   const response = await fetch(
     `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${LANGUAGE_CODE_MAP[sourceLanguage]}|${LANGUAGE_CODE_MAP[targetLanguage]}`
   );
   const data = await response.json();
   return data.responseData.translatedText;
   ```

## Enable Translation

After setting up your API, enable translation in `src/lib/translation.ts`:

```typescript
const TRANSLATION_API_ENABLED = true; // Change to true
```

## Usage Examples

### In Components:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

function PostComponent({ post }: { post: FeedPost }) {
  const { t, translate, language } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState(post.content);

  useEffect(() => {
    if (language !== 'en') {
      translate(post.content).then(setTranslatedContent);
    } else {
      setTranslatedContent(post.content);
    }
  }, [language, post.content, translate]);

  return (
    <div>
      <h2>{t('feed.createPost')}</h2>
      <p>{translatedContent}</p>
    </div>
  );
}
```

### For Multiple Texts (Batch Translation):

```typescript
import { translateBatch } from '@/lib/translation';
import { useLanguage } from '@/contexts/LanguageContext';

function FeedComponent({ posts }: { posts: FeedPost[] }) {
  const { language } = useLanguage();
  const [translatedPosts, setTranslatedPosts] = useState(posts);

  useEffect(() => {
    if (language !== 'en') {
      const texts = posts.map(p => p.content);
      translateBatch(texts, language).then(translations => {
        setTranslatedPosts(posts.map((post, i) => ({
          ...post,
          content: translations[i]
        })));
      });
    }
  }, [language, posts]);

  // Render translated posts...
}
```

## Cost Considerations

- **Google Translate API**: ~$20 per million characters
- **DeepL API**: ~$25 per million characters (better quality)
- **MyMemory API**: Free but limited (10,000 words/day)

## Next Steps

1. Choose your translation API provider
2. Set up API keys and environment variables
3. Update `src/lib/translation.ts` with the correct API implementation
4. Set `TRANSLATION_API_ENABLED = true`
5. Update components to use `translate()` for dynamic content
6. Test with different languages

## Notes

- Translations are cached to avoid repeated API calls
- If translation fails, original text is returned
- English content is not translated (skipped)
- Translation happens client-side, so API keys are exposed (use a proxy server in production)

