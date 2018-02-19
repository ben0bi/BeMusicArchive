mv config/pageconfig.json config/oldconfig.json
cp dummyconfig.json config/pageconfig.json
git add .
git commit -m "$1"
git push -u origin master
mv config/oldconfig.json config/pageconfig.json
echo "Done!"

