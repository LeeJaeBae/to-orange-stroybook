export const track = {
  ctaClick: (label: string) => console.log('[mock] track.ctaClick:', label),
  shareClick: (type: string) => console.log('[mock] track.shareClick:', type),
  pageView: (page: string) => console.log('[mock] track.pageView:', page),
};
