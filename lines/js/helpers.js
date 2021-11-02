/* Drag mouse action */
const drag = (projection) => {
  let v0, q0, r0;

  const dragstarted = () => {
    v0 = versor.cartesian(projection.invert([d3.event.x, d3.event.y]));

    q0 = versor((r0 = projection.rotate()));
  };

  const dragged = () => {
    const v1 = versor.cartesian(
      projection.rotate(r0).invert([d3.event.x, d3.event.y])
    );

    const q1 = versor.multiply(q0, versor.delta(v0, v1));

    projection.rotate(versor.rotation(q1));
  };

  return d3.drag().on('start', dragstarted).on('drag', dragged);
};

export { drag };
