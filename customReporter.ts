class CustomReporter {
  onTestEnd(test) {
    console.log(`Test finished: ${test.title}`);
  }

  onEnd(result) {
    console.log('Todos los tests han terminado');
  }
}

module.exports = CustomReporter;
