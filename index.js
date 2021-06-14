class httpRequest {
   constructor() {
      this.requestFunction
      this.responseSuccessFunction
      this.responseErroneousFunction
   }
   async apply(url, method, data) {
      let request = {
         baseUrl: '',
         method: method,
         data: data,
         headers: {},
         timeout: 500000
      };
      if (this.requestFunction) request = await this.requestFunction(request);

      const controller = new AbortController();
      let packageData = {};
      let requestOptions = {
         method: request.method,
         headers: request.headers,
         signal: controller.signal,
         body: JSON.stringify(request.data),
         redirect: 'follow'
      };
      setTimeout(() => {
         controller.abort();
      }, request.timeout);

      await fetch(request.baseUrl + url, requestOptions)
         .then(response => {
            packageData = Object.assign(response);
            return response.text();
         }).then(data => {
            packageData.data = data;
            if (packageData.status !== 200) throw new Error(data);
            if (this.responseSuccessFunction)
               packageData = this.responseSuccessFunction(packageData);
         })
         .catch(err => {
            if (this.responseErroneousFunction)
               this.responseErroneousFunction(err);
            throw new Error(err);
         })
      console.log("packageData: ", packageData);

      return packageData;

   }

   async get({ url }) {
      return await this.apply(url, 'get');
   }
   async post({ url, data }) {
      return await this.apply(url, 'post', data);
   }
   async put({ url, data }) {
      return await this.apply(url, 'put', data);
   }
   async delete({ url, data }) {
      return await this.apply(url, 'delete', data);
   }

   async interceptors(type, func1, func2) {
      if (type === 'request') {
         this.requestFunction = func1;
      } else if (type === 'response') {
         this.responseSuccessFunction = func1;
         this.responseErroneousFunction = func2;
      }
   }
}

module.exports.httpRequest = httpRequest;