
Pod::Spec.new do |s|
  s.name         = "RNMusicStatusBar"
  s.version      = "1.0.0"
  s.summary      = "RNMusicStatusBar"
  s.description  = <<-DESC
                  RNDemo
                   DESC
  s.homepage     = "http://EXAMPLE/iOS_Category"
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "10.0"
  s.source       = { :git => "https://github.com/author/RNDemo.git", :tag => "master" }
  s.source_files  = "**/*.{h,m}","*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

  
