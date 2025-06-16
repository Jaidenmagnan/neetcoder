module.exports = (queue) => {
    queue.metadata.send("I got kicked out, clearing queue");
}