/* Copyright 2019 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

#include "node_api.h"
#include "naudiodonUtil.h"
#include "GetDevices.h"
#include "GetHostAPIs.h"
#include "AudioIO.h"
#include "GetDefaultDevices.h"

napi_value Create(napi_env env, napi_callback_info info) {
  napi_status status;
  size_t argc = 1;
  napi_value args[1];

  status = napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
  CHECK_STATUS;

  napi_value instance;
  status = streampunk::AudioIO::NewInstance(env, args[0], &instance);
  CHECK_STATUS;

  return instance;
}

napi_value Init(napi_env env, napi_value exports) {
  napi_status status;

  status = streampunk::AudioIO::Init(env);
  CHECK_STATUS;

  napi_property_descriptor desc[] = {
    DECLARE_NAPI_METHOD("getDevices", streampunk::getDevices),
    DECLARE_NAPI_METHOD("getHostAPIs", streampunk::getHostAPIs),
    DECLARE_NAPI_METHOD("create", Create),
    DECLARE_NAPI_METHOD("getDefaultDevices", streampunk::getDefaultDevices)
  };
  status = napi_define_properties(env, exports, 4, desc);
  CHECK_STATUS;

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
