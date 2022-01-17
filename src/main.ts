const makeTimeoutPromise = (timeoutLength: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(Error("Fetch timeout"));
    }, timeoutLength);
  });
};

const attemptFetch = (url: string) =>
  new Promise((resolve, reject) => {
    const fetchTodoPromise = fetch(url);

    fetchTodoPromise.then((response: Response) => {
      if (response.ok) {
        resolve(response.json());
      } else {
        reject(`Invalid Response: ${response.status}`);
      }
    });
  });

const fetchWithTimeout = (url: string, timeout: number) => {
  return Promise.race([attemptFetch(url), makeTimeoutPromise(timeout)]);
};

const fetchWithTimeoutAndRetries = (
  url: string,
  timeout: number,
  maxRetries: number
) =>
  new Promise((resolve, reject) => {
    let attempts = 1;
    const executeFetch = () => {
      const newFetchAttempt = fetchWithTimeout(url, timeout);

      newFetchAttempt
        .then((data) => {
          resolve({ data, attempts });
        })
        .catch((reason) => {
          console.error(reason, attempts);
          if (attempts < maxRetries) {
            attempts++;
            executeFetch();
          } else {
            reject("All retries failed!");
          }
        });
    };

    executeFetch();
  });

const result = fetchWithTimeoutAndRetries(
  "https://jsonplaceholder.typicode.com/todos/1",
  70,
  5
);

result
  .then((result) => console.log(result, "final promise!"))
  .catch((reason) => console.log(reason));
