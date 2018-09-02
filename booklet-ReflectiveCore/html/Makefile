SITE=_result/html

.pillar:
	git clone https://github.com/pillar-markup/pillar.git .pillar -b dev-7
	cd .pillar && ./scripts/build.sh && cd ..

build:	.pillar
	.pillar/build/pillar build html

deploy:	build
	./scripts/prepare_for_deploy.sh $(SITE)
	# Added HEAD as suggested in https://stackoverflow.com/questions/4181861/src-refspec-master-does-not-match-any-when-pushing-commits-in-git
	cd $(SITE) && git push -f origin HEAD:gh-pages


clonedeploy:
	rm -rf $(SITE)
	git clone -b master `git config --get remote.origin.url` $(SITE)


clean:
	rm -rf $(SITE)
