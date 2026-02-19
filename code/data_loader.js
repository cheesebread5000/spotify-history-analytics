data = {
  
  const loadedFiles = await Promise.all([
    FileAttachment("Streaming_History_Audio_2022-2023_16.json").json(),
    FileAttachment("Streaming_History_Audio_2023-2025_17.json").json(),
    FileAttachment("Streaming_History_Audio_2019_1.json").json(),
    FileAttachment("Streaming_History_Audio_2019_2.json").json(),
    FileAttachment("Streaming_History_Audio_2019_3.json").json(),
    FileAttachment("Streaming_History_Audio_2019_4.json").json(),
    FileAttachment("Streaming_History_Audio_2019-2020_5.json").json(),
    FileAttachment("Streaming_History_Audio_2020_6.json").json(),
    FileAttachment("Streaming_History_Audio_2020_7.json").json(),
    FileAttachment("Streaming_History_Audio_2020_8.json").json(),
    FileAttachment("Streaming_History_Audio_2020_9.json").json(),
    FileAttachment("Streaming_History_Audio_2020-2021_10.json").json(),
    FileAttachment("Streaming_History_Audio_2021_11.json").json(),
    FileAttachment("Streaming_History_Audio_2021_12.json").json(), 
    FileAttachment("Streaming_History_Audio_2021_13.json").json(), 
    FileAttachment("Streaming_History_Audio_2021_14.json").json()  
  ]);

  
  const rawData = loadedFiles.flat();

  
  return rawData.map(d => {
    return {
      ...d,
      date: new Date(d.ts) 
    };
  }).filter(d => d.date instanceof Date && !isNaN(d.date)); 
}