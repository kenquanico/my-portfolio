let activeVideo: HTMLVideoElement | null = null;

export function pauseActiveVideo() {
    activeVideo?.pause();
    activeVideo = null;
}

export function pauseOtherVideo(video: HTMLVideoElement) {
    if (activeVideo && activeVideo !== video) activeVideo.pause();
    activeVideo = video;
}
