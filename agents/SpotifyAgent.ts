import axios from 'axios';
import { supabase } from '../config/supabaseClient';

export const handleSpotifyAgent = async (context: {
  access_token: string;
  user_id: string;
  title: string;
  description: string;
  keywords: string[];
}) => {
  const { access_token, user_id, title, description, keywords } = context;

  const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  };

  const trackUris: string[] = [];

  // 1. Search tracks for each keyword
  for (const keyword of keywords) {
    try {
      const searchRes = await axios.get('https://api.spotify.com/v1/search', {
        headers,
        params: {
          q: keyword,
          type: 'track',
          limit: 1,
        },
      });

      const track = searchRes.data?.tracks?.items?.[0];
      if (track?.uri) {
        trackUris.push(track.uri);
      }
    } catch (err) {
      console.warn(`[SpotifyAgent] Failed search for keyword: "${keyword}"`);
    }
  }

  if (trackUris.length === 0) {
    throw new Error('No tracks found from keywords');
  }

  // 2. Create playlist
  const createRes = await axios.post(
    `https://api.spotify.com/v1/users/${user_id}/playlists`,
    {
      name: title,
      description,
      public: false,
    },
    { headers }
  );

  const playlistId = createRes.data.id;
  const playlistUrl = createRes.data.external_urls.spotify;

  // 3. Add tracks to playlist
  await axios.post(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    { uris: trackUris },
    { headers }
  );

  // 4. Save playlist to Supabase
  const { error: dbError } = await supabase.from('Playlists').insert({
    user_id,
    title,
    description,
    spotify_url: playlistUrl,
    track_count: trackUris.length,
  });

  if (dbError) {
    console.error('[Supabase Insert Error]', dbError);
    throw new Error('Failed to save playlist to database');
  }

  return {
    success: true,
    playlist_url: playlistUrl,
    playlist_id: playlistId,
    total_tracks: trackUris.length,
  };
};
