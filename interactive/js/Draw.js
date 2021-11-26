export const GroupCirclesPack = () => {
    d3.select('.pack-group').attr('transform', 'scale(2)');
    d3.selectAll('.bubble').attr('transform', d => `translate(${d.x},${d.y})`);
    d3.selectAll('.labels').attr('transform', d => `translate(${d.x},${d.y})`);
};

export const MapCirclesPack = () => {
    d3.select('.pack-group').attr('transform', 'scale(1)');
    d3.selectAll('.bubble').attr('transform', d => d.parent && d.parent.data.d ? `translate(${d.relx + d.parent.data.d.force.x},${d.rely + d.parent.data.d.force.y})` : 'translate(-10000,-10000)');
    d3.selectAll('.labels').attr('transform', d => d.parent && d.parent.data.d ? `translate(${d.relx + d.parent.data.d.force.x},${d.rely + d.parent.data.d.force.y})` : 'translate(-10000,-10000)');
};
