{
  "targets": [
    {
      "target_name": "naudiodon",
      "sources": [
        "src/naudiodonUtil.cc",
        "src/naudiodon.cc",
        "src/GetDevices.cc",
        "src/GetHostAPIs.cc",
        "src/GetDefaultDevices.cc",
      	"src/AudioIO.cc",
      	"src/PaContext.cc"
      ],
      "include_dirs": [
        "portaudio/include"
      ],
      "conditions" : [
        [
          'OS=="mac"', {
            'xcode_settings': {
              'GCC_ENABLE_CPP_RTTI': 'YES',
              'MACOSX_DEPLOYMENT_TARGET': '10.7',
              'OTHER_CPLUSPLUSFLAGS': [
                '-std=c++11',
                '-stdlib=libc++',
                '-fexceptions'
              ]
            },
            "link_settings": {
              "libraries": [
                "-Wl,-rpath,@loader_path"
              ]
            },
            "libraries": [
              "libportaudio.dylib"
            ],
            "copies": [
              {
                "destination": "build/Release/",
                "files": [
                  "<!@(ls -1 portaudio/bin/libportaudio.dylib)"
                ]
              }
            ]
          },
        ],
        [
          'OS=="win"', {
            "configurations": {
              "Release": {
                "msvs_settings": {
                  "VCCLCompilerTool": {
                    "RuntimeTypeInfo": "true",
                    "ExceptionHandling": 1
                  }
                }
              }
            },
            "libraries": [
               "-l../portaudio/bin/portaudio_x64.lib"
            ],
            "copies": [
              {
                "destination": "build/Release",
                "files": [
                  "portaudio/bin/portaudio_x64.dll"
                ]
              }
            ]
          },
        ],
        [
          'OS=="linux"', {
            "conditions": [
              ['target_arch=="arm"', {
                "cflags_cc!": [
                  "-fno-rtti",
                  "-fno-exceptions"
                ],
                "cflags_cc": [
                  "-std=c++11",
                  "-fexceptions"
                ],
                "link_settings": {
                  "libraries": [
                    "<@(module_root_dir)/build/Release/libportaudio.so.2" 
                  ],
                  "ldflags": [
                    "-L<@(module_root_dir)/build/Release",
                    "-Wl,-rpath,<@(module_root_dir)/build/Release"
                  ]
                },
                "copies": [
                  {
                    "destination": "build/Release/",
                    "files": [
                      "<@(module_root_dir)/portaudio/bin_armhf/libportaudio.so.2"
                    ]
                  }
                ]
              },
              { # ia32 or x64
                "cflags_cc!": [
                  "-fno-rtti",
                  "-fno-exceptions"
                 ],
                 "cflags_cc": [
                   "-std=c++11",
                   "-fexceptions"
                 ],
                "link_settings": {
                  "libraries": [
                    "<@(module_root_dir)/build/Release/libportaudio.so.2"
                  ],
                  "ldflags": [
                  "-L<@(module_root_dir)/build/Release",
                  "-Wl,-rpath,<@(module_root_dir)/build/Release"
                  ]
                },
                "copies": [
                  {
                    "destination": "build/Release/",
                    "files": [
                      "<@(module_root_dir)/portaudio/bin/libportaudio.so.2"
                    ]
                  }
                ]
              }]
            ]
          }
        ]
      ]
    }
  ]
}
