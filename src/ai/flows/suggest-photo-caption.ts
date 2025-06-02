'use server';

/**
 * @fileOverview A flow that suggests captions for photos using AI.
 *
 * - suggestPhotoCaption - A function that handles the caption suggestion process.
 * - SuggestPhotoCaptionInput - The input type for the suggestPhotoCaption function.
 * - SuggestPhotoCaptionOutput - The return type for the suggestPhotoCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPhotoCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  context: z.string().describe('Additional context about the photo.'),
});
export type SuggestPhotoCaptionInput = z.infer<typeof SuggestPhotoCaptionInputSchema>;

const SuggestPhotoCaptionOutputSchema = z.object({
  captions: z.array(z.string()).describe('An array of suggested captions for the photo.'),
});
export type SuggestPhotoCaptionOutput = z.infer<typeof SuggestPhotoCaptionOutputSchema>;

export async function suggestPhotoCaption(input: SuggestPhotoCaptionInput): Promise<SuggestPhotoCaptionOutput> {
  return suggestPhotoCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPhotoCaptionPrompt',
  input: {schema: SuggestPhotoCaptionInputSchema},
  output: {schema: SuggestPhotoCaptionOutputSchema},
  prompt: `You are a creative caption writer for a relationship app.

  Given a photo and some context, you will generate several captions for the photo.
  Return 3 possible captions.

  Photo: {{media url=photoDataUri}}
  Context: {{{context}}}`,
});

const suggestPhotoCaptionFlow = ai.defineFlow(
  {
    name: 'suggestPhotoCaptionFlow',
    inputSchema: SuggestPhotoCaptionInputSchema,
    outputSchema: SuggestPhotoCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
