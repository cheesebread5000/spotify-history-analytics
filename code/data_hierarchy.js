hierarchyData = {
  const artistCount = 7;
  const songsPerArtist = 4;

  const validItems = data.filter(d => {
    return d.master_metadata_album_artist_name && d.master_metadata_track_name;
  });

  const getTop = (items, keyFn, limit) => {
    const rolled = d3.rollup(
      items, 
      v => d3.sum(v, d => d.ms_played), 
      keyFn
    );
    
    return Array.from(rolled, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  };

  const topArtists = getTop(validItems, d => d.master_metadata_album_artist_name, artistCount);

  const children = topArtists.map(artist => {
    const artistStreams = validItems.filter(d => d.master_metadata_album_artist_name === artist.name);
    const topSongs = getTop(artistStreams, d => d.master_metadata_track_name, songsPerArtist);
    
    return {
      name: artist.name, 
      children: topSongs.map(s => ({ name: s.name, value: s.value }))
    };
  });

  return { name: "My Top Hits", children: children };
}